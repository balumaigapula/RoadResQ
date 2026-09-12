from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Vehicle(TimeStampedModel):
    class VehicleType(models.TextChoices):
        CAR = 'Car', 'Car'
        TWO_WHEELER = 'Two-Wheeler', 'Two-Wheeler'

    class FuelType(models.TextChoices):
        PETROL = 'Petrol', 'Petrol'
        DIESEL = 'Diesel', 'Diesel'
        CNG = 'CNG', 'CNG'
        ELECTRIC = 'Electric', 'Electric'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles')
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices, default=VehicleType.CAR)
    vehicle_number = models.CharField(max_length=20, db_index=True)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    fuel_type = models.CharField(max_length=20, choices=FuelType.choices, default=FuelType.PETROL)
    year = models.PositiveIntegerField()
    image = models.ImageField(upload_to='vehicle_images/', blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', '-created_at']
        indexes = [models.Index(fields=['user']), models.Index(fields=['vehicle_number'])]

    def __str__(self):
        return f'{self.brand} {self.model} ({self.vehicle_number})'

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        if is_new and not Vehicle.objects.filter(user=self.user).exists():
            # First vehicle for this user — always starts as primary.
            self.is_primary = True
        super().save(*args, **kwargs)
        if self.is_primary:
            Vehicle.objects.filter(user=self.user).exclude(pk=self.pk).update(is_primary=False)
