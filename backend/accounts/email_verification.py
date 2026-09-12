import logging
import secrets
import sys
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from accounts.models import EmailVerificationToken

logger = logging.getLogger('django')

RESEND_COOLDOWN_SECONDS = 60


def generate_verification_token() -> str:
    """Cryptographically secure URL-safe token (32 bytes = 43 chars)."""
    return secrets.token_urlsafe(32)


def can_resend_verification(user) -> bool:
    latest = EmailVerificationToken.objects.filter(user=user).order_by('-created_at').first()
    if not latest:
        return True
    cooldown_ends = latest.created_at + timedelta(seconds=RESEND_COOLDOWN_SECONDS)
    return timezone.now() >= cooldown_ends


def seconds_until_resend(user) -> int:
    latest = EmailVerificationToken.objects.filter(user=user).order_by('-created_at').first()
    if not latest:
        return 0
    remaining = (latest.created_at + timedelta(seconds=RESEND_COOLDOWN_SECONDS) - timezone.now())
    return max(0, int(remaining.total_seconds()))


def send_verification_email(user, raw_token: str):
    """
    Renders and sends the single-use email verification link to the user.
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    verification_url = f"{frontend_url}/verify-email?token={raw_token}"

    context = {
        'first_name': user.first_name or 'User',
        'verification_url': verification_url,
    }

    subject = 'Verify your email — RoadResQ'
    html_body = render_to_string('emails/verify_email.html', context)
    text_body = strip_tags(html_body)

    try:
        send_mail(
            subject=subject,
            message=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_body,
            fail_silently=False,
        )
        if settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
            sys.stdout.write(f"\n[RoadResQ SMTP SUCCESS] Verification email sent to {user.email} via Gmail SMTP.\n\n")
            sys.stdout.flush()
        else:
            sys.stdout.write(
                f"\n========================================================================\n"
                f"[RoadResQ EMAIL VERIFICATION LINK]\n"
                f"  Recipient: {user.email}\n"
                f"  Link: {verification_url}\n"
                f"========================================================================\n\n"
            )
            sys.stdout.flush()
    except Exception as exc:
        sys.stderr.write(
            f"\n========================================================================\n"
            f"[RoadResQ SMTP ERROR] Failed to send verification email to {user.email}!\n"
            f"  Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT} (TLS: {settings.EMAIL_USE_TLS})\n"
            f"  User: {settings.EMAIL_HOST_USER or '[MISSING in .env]'}\n"
            f"  Backend: {settings.EMAIL_BACKEND}\n"
            f"  Error Type: {type(exc).__name__}\n"
            f"  Error Details: {exc}\n"
            f"========================================================================\n"
        )
        sys.stderr.flush()
        logger.exception("SMTP email verification delivery failed for %s", user.email)
        if settings.DEBUG:
            sys.stdout.write(
                f"[RoadResQ DEV LINK FALLBACK] Verification link for {user.email}:\n"
                f"  {verification_url}\n\n"
            )
            sys.stdout.flush()
        else:
            raise exc


def issue_verification_email(user):
    """
    Invalidates any previous unused tokens, creates a new 24h single-use token,
    and dispatches the verification email.
    """
    # Invalidate previous unused tokens for this user
    EmailVerificationToken.objects.filter(user=user, is_used=False).delete()

    raw_token = generate_verification_token()
    token_obj = EmailVerificationToken.create_for(user, raw_token)
    send_verification_email(user, raw_token)
    return token_obj
