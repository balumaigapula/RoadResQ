from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User
from providers.models import ProviderProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_provider_profile(sender, instance, created, **kwargs):
    """Every PROVIDER-role user gets a (pending) ProviderProfile automatically,
    so the frontend's provider onboarding screens always have something to
    read/patch without a separate "create profile" step."""
    if created and instance.role == User.Role.PROVIDER:
        ProviderProfile.objects.get_or_create(
            user=instance,
            defaults={'business_name': instance.get_full_name() or instance.email.split('@')[0]},
        )
