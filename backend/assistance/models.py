from django.conf import settings
from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel
from services.models import ProblemType, ServiceCategory
from vehicles.models import Vehicle


class RequestStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Requested'
    SEARCHING = 'SEARCHING', 'Searching'
    PROVIDER_ASSIGNED = 'PROVIDER_ASSIGNED', 'Provider Assigned'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    ON_THE_WAY = 'ON_THE_WAY', 'On The Way'
    ARRIVED = 'ARRIVED', 'Arrived'
    REPAIRING = 'REPAIRING', 'Repairing'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class RequestPriority(models.TextChoices):
    NORMAL = 'NORMAL', 'Normal'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'


# Explicit allow-list of status transitions — see project requirement #23.
# Cancellation is allowed from any non-terminal state and is handled
# separately in services.py rather than listed on every row here.
ALLOWED_TRANSITIONS = {
    RequestStatus.REQUESTED: {RequestStatus.SEARCHING, RequestStatus.CANCELLED},
    RequestStatus.SEARCHING: {RequestStatus.PROVIDER_ASSIGNED, RequestStatus.CANCELLED},
    RequestStatus.PROVIDER_ASSIGNED: {RequestStatus.ACCEPTED, RequestStatus.CANCELLED, RequestStatus.SEARCHING},
    RequestStatus.ACCEPTED: {RequestStatus.ON_THE_WAY, RequestStatus.CANCELLED},
    RequestStatus.ON_THE_WAY: {RequestStatus.ARRIVED, RequestStatus.CANCELLED},
    RequestStatus.ARRIVED: {RequestStatus.REPAIRING, RequestStatus.CANCELLED},
    RequestStatus.REPAIRING: {RequestStatus.COMPLETED},
    RequestStatus.COMPLETED: set(),
    RequestStatus.CANCELLED: set(),
}


class AssistanceRequest(TimeStampedModel):
    request_number = models.CharField(max_length=20, unique=True, db_index=True)

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requests_made')
    provider = models.ForeignKey('providers.ProviderProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='requests_received')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, null=True, blank=True, related_name='requests')

    service_category = models.CharField(max_length=30, choices=ServiceCategory.choices)
    problem_type = models.CharField(max_length=30, choices=ProblemType.choices, blank=True)
    problem_description = models.TextField(blank=True)
    problem_image = models.ImageField(upload_to='problem_images/', blank=True, null=True)

    priority = models.CharField(max_length=10, choices=RequestPriority.choices, default=RequestPriority.NORMAL, db_index=True)
    is_sos = models.BooleanField(default=False)
    emergency_type = models.CharField(max_length=50, blank=True)

    # Location is captured per-request, never assumed from the profile.
    latitude = models.DecimalField(max_digits=9, decimal_places=6, db_index=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, db_index=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=15, blank=True)

    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.REQUESTED, db_index=True)

    estimated_distance_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    estimated_eta_minutes = models.PositiveIntegerField(null=True, blank=True)

    estimated_service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    travel_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    additional_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    accepted_at = models.DateTimeField(null=True, blank=True)
    on_the_way_at = models.DateTimeField(null=True, blank=True)
    arrived_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.CharField(max_length=10, blank=True)  # 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
    cancellation_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer']),
            models.Index(fields=['provider']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.request_number

    def recalculate_total(self):
        self.total_amount = (
            (self.estimated_service_charge or 0)
            + (self.travel_charge or 0)
            + (self.parts_cost or 0)
            + (self.additional_charge or 0)
        )

    def can_transition_to(self, new_status: str) -> bool:
        if new_status == RequestStatus.CANCELLED:
            return self.status not in (RequestStatus.COMPLETED, RequestStatus.CANCELLED)
        return new_status in ALLOWED_TRANSITIONS.get(self.status, set())

    @staticmethod
    def generate_request_number():
        today = timezone.localdate().strftime('%Y%m%d')
        prefix = f'RR-{today}-'
        last = AssistanceRequest.objects.filter(request_number__startswith=prefix).order_by('-request_number').first()
        next_seq = 1
        if last:
            try:
                next_seq = int(last.request_number.rsplit('-', 1)[-1]) + 1
            except ValueError:
                next_seq = 1
        return f'{prefix}{next_seq:04d}'
