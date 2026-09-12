import uuid

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class PaymentMethod(models.TextChoices):
    CASH = 'CASH', 'Cash'
    UPI = 'UPI', 'UPI'
    ONLINE = 'ONLINE', 'Online'


class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SUCCESS = 'SUCCESS', 'Success'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'


class Payment(TimeStampedModel):
    request = models.OneToOneField('assistance.AssistanceRequest', on_delete=models.CASCADE, related_name='payment')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments_made')
    provider = models.ForeignKey('providers.ProviderProfile', on_delete=models.SET_NULL, null=True, related_name='payments_received')

    service_charge = models.DecimalField(max_digits=10, decimal_places=2)
    travel_charge = models.DecimalField(max_digits=10, decimal_places=2)
    parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    additional_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    transaction_id = models.CharField(max_length=64, unique=True, default=uuid.uuid4, editable=False)

    # Structural fields for a future Razorpay integration — never populated
    # with real secrets, and payment_status is only ever flipped to SUCCESS
    # after backend-side verification (see gateways.py).
    gateway_order_id = models.CharField(max_length=100, blank=True)
    gateway_payment_id = models.CharField(max_length=100, blank=True)
    gateway_signature = models.CharField(max_length=255, blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=['customer']), models.Index(fields=['payment_status'])]

    def __str__(self):
        return f'{self.transaction_id} — ₹{self.total_amount}'
