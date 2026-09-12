from django.conf import settings as dj_settings
from django.contrib.auth import authenticate
from django.db import transaction
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


from accounts.models import EmailVerificationToken, OTPVerification, User
from accounts.otp import can_resend, issue_otp, seconds_until_resend
from accounts.serializers import (
    ChangePasswordSerializer, ForgotPasswordSerializer, LoginSerializer,
    ProfileImageSerializer, ProfileUpdateSerializer, RegisterSerializer,
    ResendOTPSerializer, ResetPasswordSerializer, UserSerializer,
    VerifyOTPSerializer, VerifyPasswordOTPSerializer,
)
from common.response import error, success


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = next(iter(serializer.errors.values()), None)
            if first_err and isinstance(first_err, list) and first_err:
                msg = str(first_err[0])
            elif first_err:
                msg = str(first_err)
            else:
                msg = 'Registration failed'
            return error(msg, errors=serializer.errors, status=400)
        user = serializer.save()
        tokens = _tokens_for(user)
        return success(
            data={**tokens, 'user': UserSerializer(user, context={'request': request}).data},
            message='Account created successfully! You are now logged in.',
            status=201,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def get(self, request, token):
        frontend_url = getattr(dj_settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        accept_hdr = request.META.get('HTTP_ACCEPT', '')
        is_browser = 'text/html' in accept_hdr and 'application/json' not in accept_hdr

        token_hash = EmailVerificationToken.hash_token(token)
        record = EmailVerificationToken.objects.filter(token_hash=token_hash).select_related('user').first()

        if not record:
            if is_browser:
                return redirect(f"{frontend_url}/verify-email?status=invalid")
            return error('Invalid or unrecognized verification link.', errors={'code': 'INVALID_TOKEN'}, status=400)

        if record.is_used:
            if is_browser:
                return redirect(f"{frontend_url}/verify-email?status=already_used")
            return error('This verification link has already been used.', errors={'code': 'ALREADY_USED'}, status=400)

        if record.is_expired():
            if is_browser:
                return redirect(f"{frontend_url}/verify-email?status=expired&email={record.user.email}")
            return error('This verification link has expired. Please request a new one.', errors={'code': 'EXPIRED'}, status=400)

        record.is_used = True
        record.save(update_fields=['is_used'])

        user = record.user
        user.is_verified = True
        user.is_active = True
        user.save(update_fields=['is_verified', 'is_active'])

        if is_browser:
            return redirect(f"{frontend_url}/verify-email?status=success")

        return success(
            data={'email': user.email},
            message='Email verified successfully! You can now log in.',
        )


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        if not email:
            return error('Email address is required.', status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return error('No account found for this email address.', status=404)

        if user.is_verified:
            return error('This account is already verified. Please log in.', status=400)

        if not can_resend_verification(user):
            wait = verification_seconds_until_resend(user)
            return error(f'Please wait {wait}s before requesting another verification email.', status=429)

        try:
            issue_verification_email(user)
        except Exception as exc:
            return error(
                f'Failed to send verification email: {str(exc)}. Please check SMTP configuration.',
                errors={'email_delivery': str(exc)},
                status=500,
            )

        return success(
            data={'email': user.email, 'cooldown_seconds': RESEND_COOLDOWN_SECONDS},
            message='A fresh verification link has been sent to your email.',
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid request', errors=serializer.errors, status=400)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return error('No account found for this email.', status=404)

        record = OTPVerification.objects.filter(
            user=user, purpose=OTPVerification.Purpose.REGISTRATION, is_verified=False
        ).order_by('-created_at').first()

        if not record:
            return error('No pending verification found. Please request a new code.', status=400)
        if record.is_locked():
            return error('Too many attempts. Please request a new code.', status=429)
        if record.is_expired():
            return error('This code has expired. Please request a new one.', status=400)

        if not record.check_otp(otp):
            record.attempts += 1
            record.save(update_fields=['attempts'])
            from django.conf import settings as dj_settings
            remaining = max(0, dj_settings.OTP_MAX_ATTEMPTS - record.attempts)
            return error('Invalid OTP. Please try again.', errors={'attempts_remaining': remaining}, status=400)

        record.is_verified = True
        record.save(update_fields=['is_verified'])
        user.is_verified = True
        user.save(update_fields=['is_verified'])

        return success(message='Account verified successfully. You can now log in.')


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid request', errors=serializer.errors, status=400)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return error('No account found for this email.', status=404)

        if user.is_verified:
            return error('This account is already verified.', status=400)

        if not can_resend(user, OTPVerification.Purpose.REGISTRATION):
            wait = seconds_until_resend(user, OTPVerification.Purpose.REGISTRATION)
            return error(f'Please wait {wait}s before requesting another code.', status=429)

        try:
            issue_otp(user, OTPVerification.Purpose.REGISTRATION)
        except Exception as exc:
            return error(
                f"Failed to deliver verification email: {str(exc)}. Please verify your SMTP settings in .env.",
                errors={'email_delivery': str(exc)},
                status=500,
            )
        return success(message='A new verification code has been sent to your email.')


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid request', errors=serializer.errors, status=400)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if user is None:
            return error('Invalid email or password.', status=401)
        if not user.is_active:
            return error('This account has been deactivated. Contact support.', status=403)

        tokens = _tokens_for(user)
        return success(
            data={**tokens, 'user': UserSerializer(user, context={'request': request}).data},
            message='Login successful',
        )


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return error('Refresh token is required.', status=400)
        try:
            refresh = RefreshToken(refresh_token)
            data = {'access': str(refresh.access_token)}
        except TokenError:
            return error('Invalid or expired refresh token. Please log in again.', status=401)
        return success(data=data, message='Token refreshed')


class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        try:
            if refresh_token:
                RefreshToken(refresh_token).blacklist()
        except TokenError:
            pass  # Already invalid/expired — logout still succeeds client-side.
        return success(message='Logged out successfully.')


class MeView(APIView):
    def get(self, request):
        return success(data=UserSerializer(request.user, context={'request': request}).data)


class ProfileView(APIView):
    def get(self, request):
        return success(data=UserSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return error('Unable to update profile.', errors=serializer.errors, status=400)
        serializer.save()
        return success(
            data=UserSerializer(request.user, context={'request': request}).data,
            message='Profile updated successfully.',
        )


class ProfileImageView(APIView):
    def post(self, request):
        serializer = ProfileImageSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return error('Unable to upload image.', errors=serializer.errors, status=400)
        serializer.save()
        return success(
            data=UserSerializer(request.user, context={'request': request}).data,
            message='Profile photo updated.',
        )

    def delete(self, request):
        if request.user.profile_image:
            request.user.profile_image.delete(save=False)
        request.user.profile_image = None
        request.user.save(update_fields=['profile_image'])
        return success(message='Profile photo removed.')


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Unable to change password.', errors=serializer.errors, status=400)
        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return error('Current password is incorrect.', status=400)
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return success(message='Password changed successfully.')


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid request', errors=serializer.errors, status=400)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Do not reveal whether the email exists.
            return success(message='If an account exists for this email, a reset code has been sent.')

        if not can_resend(user, OTPVerification.Purpose.PASSWORD_RESET):
            wait = seconds_until_resend(user, OTPVerification.Purpose.PASSWORD_RESET)
            return error(f'Please wait {wait}s before requesting another code.', status=429)

        try:
            issue_otp(user, OTPVerification.Purpose.PASSWORD_RESET)
        except Exception as exc:
            return error(
                f"Failed to deliver reset email: {str(exc)}. Please verify your SMTP settings in .env.",
                errors={'email_delivery': str(exc)},
                status=500,
            )
        return success(message='If an account exists for this email, a reset code has been sent.')


class VerifyPasswordOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyPasswordOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid request', errors=serializer.errors, status=400)
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return error('Invalid code.', status=400)

        record = OTPVerification.objects.filter(
            user=user, purpose=OTPVerification.Purpose.PASSWORD_RESET, is_verified=False
        ).order_by('-created_at').first()
        if not record or record.is_locked():
            return error('Too many attempts or no pending reset. Please request a new code.', status=429)
        if record.is_expired():
            return error('This code has expired. Please request a new one.', status=400)
        if not record.check_otp(otp):
            record.attempts += 1
            record.save(update_fields=['attempts'])
            return error('Invalid OTP. Please try again.', status=400)

        return success(message='Code verified. You can now set a new password.')


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Unable to reset password.', errors=serializer.errors, status=400)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return error('Invalid request.', status=400)

        record = OTPVerification.objects.filter(
            user=user, purpose=OTPVerification.Purpose.PASSWORD_RESET, is_verified=False
        ).order_by('-created_at').first()
        if not record or record.is_locked() or record.is_expired() or not record.check_otp(otp):
            return error('This code is invalid or has expired. Please start over.', status=400)

        user.set_password(serializer.validated_data['password'])
        user.save(update_fields=['password'])
        record.is_verified = True
        record.save(update_fields=['is_verified'])

        return success(message='Password updated successfully. Please log in.')
