from rest_framework.permissions import BasePermission

from accounts.models import User


class IsCustomer(BasePermission):
    message = 'Only customers can perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.CUSTOMER)


class IsProvider(BasePermission):
    message = 'Only service providers can perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.PROVIDER)


class IsAdminRole(BasePermission):
    message = 'Only administrators can perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsApprovedProvider(BasePermission):
    """Stronger check used before a provider can act on live requests —
    role alone isn't enough; they must also be admin-approved."""
    message = 'Your provider account is not approved yet.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.role == User.Role.PROVIDER):
            return False
        profile = getattr(request.user, 'provider_profile', None)
        return bool(profile and profile.verification_status == profile.VerificationStatus.APPROVED)
