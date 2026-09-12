from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from common.models import TimeStampedModel


class Review(TimeStampedModel):
    request = models.OneToOneField('assistance.AssistanceRequest', on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_written')
    provider = models.ForeignKey('providers.ProviderProfile', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=['provider']), models.Index(fields=['customer'])]

    def __str__(self):
        return f'{self.rating}★ — {self.provider.business_name}'
