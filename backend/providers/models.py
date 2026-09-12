from django.conf import settings
from django.db import models

from common.models import TimeStampedModel
from services.models import ServiceCategory


class ProviderProfile(TimeStampedModel):
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='provider_profile')
    business_name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    service_types = models.JSONField(default=list, help_text='List of ServiceCategory values this provider offers.')
    experience_years = models.PositiveSmallIntegerField(default=0)
    profile_image = models.ImageField(upload_to='provider_images/', blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    service_radius_km = models.PositiveSmallIntegerField(default=15)

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    completed_services = models.PositiveIntegerField(default=0)
    acceptance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100)

    is_online = models.BooleanField(default=False)
    verification_status = models.CharField(max_length=15, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)

    class Meta:
        indexes = [
            models.Index(fields=['verification_status', 'is_online']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def __str__(self):
        return self.business_name

    @property
    def is_available(self):
        return self.is_online and self.verification_status == self.VerificationStatus.APPROVED

    def supports(self, service_category: str) -> bool:
        return service_category in (self.service_types or [])


class ProviderLocation(TimeStampedModel):
    """Latest known location, updated continuously while a provider is
    online (and more frequently during an active service via WebSocket)."""
    provider = models.OneToOneField(ProviderProfile, on_delete=models.CASCADE, related_name='live_location')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.provider.business_name} @ ({self.latitude}, {self.longitude})'
