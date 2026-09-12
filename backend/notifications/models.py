from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    REQUEST_RECEIVED = 'REQUEST_RECEIVED', 'Request Received'
    PROVIDER_FOUND = 'PROVIDER_FOUND', 'Provider Found'
    PROVIDER_ACCEPTED = 'PROVIDER_ACCEPTED', 'Provider Accepted'
    PROVIDER_ON_THE_WAY = 'PROVIDER_ON_THE_WAY', 'Provider On The Way'
    PROVIDER_ARRIVED = 'PROVIDER_ARRIVED', 'Provider Arrived'
    SERVICE_COMPLETED = 'SERVICE_COMPLETED', 'Service Completed'
    PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL', 'Payment Successful'
    NEW_REQUEST = 'NEW_REQUEST', 'New Request'
    CUSTOMER_CANCELLED = 'CUSTOMER_CANCELLED', 'Customer Cancelled'
    SERVICE_ASSIGNED = 'SERVICE_ASSIGNED', 'Service Assigned'


class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.CharField(max_length=500)
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    request = models.ForeignKey('assistance.AssistanceRequest', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['recipient', 'is_read'])]

    def __str__(self):
        return f'{self.notification_type} → {self.recipient.email}'
