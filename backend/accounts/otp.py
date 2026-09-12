"""
Real OTP generation + delivery. No OTP is ever hardcoded, logged in an API
response, or faked — this module is the single place that creates and sends
one-time codes for both registration and password reset.
"""
import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from accounts.models import OTPVerification

logger = logging.getLogger('django')

def generate_otp() -> str:
    """Cryptographically secure numeric OTP of configured length."""
    length = settings.OTP_LENGTH
    return ''.join(str(secrets.randbelow(10)) for _ in range(length))


def can_resend(user, purpose) -> bool:
    latest = OTPVerification.objects.filter(user=user, purpose=purpose).order_by('-created_at').first()
    if not latest:
        return True
    cooldown_ends = latest.created_at + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
    return timezone.now() >= cooldown_ends


def seconds_until_resend(user, purpose) -> int:
    latest = OTPVerification.objects.filter(user=user, purpose=purpose).order_by('-created_at').first()
    if not latest:
        return 0
    remaining = (latest.created_at + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS) - timezone.now())
    return max(0, int(remaining.total_seconds()))


def send_otp_email(user, otp: str, purpose: str):
    subject_map = {
        OTPVerification.Purpose.REGISTRATION: 'RoadResQ Account Verification OTP',
        OTPVerification.Purpose.PASSWORD_RESET: 'RoadResQ Password Reset OTP',
        OTPVerification.Purpose.EMAIL_VERIFICATION: 'RoadResQ Email Verification OTP',
    }
    subject = subject_map.get(purpose, 'RoadResQ Verification OTP')
    context = {
        'first_name': user.first_name,
        'otp': otp,
        'expiry_minutes': settings.OTP_EXPIRY_MINUTES,
        'purpose': purpose,
    }
    html_body = render_to_string('emails/otp_email.html', context)
    text_body = strip_tags(html_body)

    import sys
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
            sys.stdout.write(f"\n[RoadResQ SMTP SUCCESS] Real OTP email successfully delivered to {user.email} via Gmail SMTP.\n\n")
            sys.stdout.flush()
    except Exception as exc:
        sys.stderr.write(
            f"\n========================================================================\n"
            f"[RoadResQ SMTP ERROR] Failed to deliver OTP email to {user.email}!\n"
            f"  Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT} (TLS: {settings.EMAIL_USE_TLS})\n"
            f"  User: {settings.EMAIL_HOST_USER or '[MISSING in .env]'}\n"
            f"  Backend: {settings.EMAIL_BACKEND}\n"
            f"  Error Type: {type(exc).__name__}\n"
            f"  Error Details: {exc}\n"
            f"========================================================================\n"
        )
        sys.stderr.flush()
        logger.exception("SMTP delivery failed for OTP to %s", user.email)
        if settings.DEBUG:
            sys.stdout.write(f"[RoadResQ DEV FALLBACK] Real OTP for {user.email}: {otp}\n\n")
            sys.stdout.flush()
        else:
            raise exc


def send_otp_sms(user, otp: str):
    """
    Provider-independent SMS dispatch. Set SMS_PROVIDER to 'twilio', 'msg91',
    etc. and implement the branch — kept as a clear extension point rather
    than a live integration, since no SMS credentials are provided by
    default. Never raises: SMS is a bonus channel, email is authoritative.
    """
    provider = settings.SMS_PROVIDER
    if not provider:
        return False
    try:
        if provider.lower() == 'twilio':
            pass  # Future: from twilio.rest import Client; Client(...).messages.create(...)
        elif provider.lower() == 'msg91':
            pass  # Future: requests.post('https://api.msg91.com/...', ...)
        else:
            logger.warning('Unknown SMS_PROVIDER "%s" — SMS not sent.', provider)
            return False
        return True
    except Exception:
        logger.exception('SMS OTP delivery failed for user %s', user.id)
        return False


def issue_otp(user, purpose):
    """Generates, stores (hashed) and sends a new OTP. Returns the OTPVerification row."""
    raw_otp = generate_otp()
    record = OTPVerification.create_for(user, purpose, raw_otp)
    send_otp_email(user, raw_otp, purpose)
    send_otp_sms(user, raw_otp)
    return record