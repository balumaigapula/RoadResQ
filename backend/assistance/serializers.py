from rest_framework import serializers

from assistance.models import AssistanceRequest
from common.validators import validate_image_file
from providers.models import ProviderProfile
from services.models import ProblemType, ServiceCategory
from vehicles.models import Vehicle


class AssistanceRequestSerializer(serializers.ModelSerializer):
    """Read serializer — shaped close to the frontend's mock request objects
    (id, status, priority, service, vehicle, providerName, createdAt, amount)
    while keeping full backend fields available for pages that need them."""
    id = serializers.CharField(source='request_number', read_only=True)
    service = serializers.CharField(source='get_service_category_display', read_only=True)
    vehicle = serializers.SerializerMethodField()
    providerName = serializers.SerializerMethodField()
    providerId = serializers.IntegerField(source='provider_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    amount = serializers.DecimalField(source='total_amount', max_digits=10, decimal_places=2, read_only=True)
    etaMinutes = serializers.IntegerField(source='estimated_eta_minutes', read_only=True)
    distance = serializers.DecimalField(source='estimated_distance_km', max_digits=6, decimal_places=2, read_only=True)
    problemImage = serializers.SerializerMethodField()

    class Meta:
        model = AssistanceRequest
        fields = [
            'id', 'request_number', 'status', 'priority', 'is_sos', 'emergency_type',
            'service', 'service_category', 'problem_type', 'problem_description', 'problemImage',
            'vehicle', 'providerName', 'providerId', 'createdAt', 'amount',
            'estimated_service_charge', 'travel_charge', 'parts_cost', 'additional_charge', 'total_amount',
            'etaMinutes', 'distance', 'latitude', 'longitude', 'address',
            'accepted_at', 'on_the_way_at', 'arrived_at', 'started_at', 'completed_at', 'cancelled_at',
        ]

    def get_vehicle(self, obj):
        if not obj.vehicle:
            return 'Not specified'
        return f'{obj.vehicle.brand} {obj.vehicle.model} · {obj.vehicle.vehicle_number}'

    def get_providerName(self, obj):
        return obj.provider.business_name if obj.provider else None

    def get_problemImage(self, obj):
        if not obj.problem_image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.problem_image.url) if request else obj.problem_image.url


class CreateAssistanceRequestSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField(required=False, allow_null=True)
    service_category = serializers.ChoiceField(choices=ServiceCategory.choices)
    problem_type = serializers.ChoiceField(choices=ProblemType.choices, required=False, allow_blank=True)
    problem_description = serializers.CharField(required=False, allow_blank=True)
    problem_image = serializers.ImageField(required=False, allow_null=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)
    provider_id = serializers.IntegerField(required=False, allow_null=True)
    priority = serializers.ChoiceField(choices=['NORMAL', 'HIGH', 'CRITICAL'], required=False, default='NORMAL')

    def validate_problem_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate_vehicle_id(self, value):
        if value is None:
            return value
        request = self.context['request']
        if not Vehicle.objects.filter(id=value, user=request.user).exists():
            raise serializers.ValidationError('You can only request assistance for your own vehicle.')
        return value

    def validate_provider_id(self, value):
        if value is None:
            return value
        if not ProviderProfile.objects.filter(id=value, verification_status=ProviderProfile.VerificationStatus.APPROVED).exists():
            raise serializers.ValidationError('Selected provider is not available.')
        return value


class SOSRequestSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField(required=False, allow_null=True)
    emergency_type = serializers.ChoiceField(choices=['accident', 'breakdown', 'immobile', 'medical', 'other'])
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    address = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_vehicle_id(self, value):
        if value is None:
            return value
        request = self.context['request']
        if not Vehicle.objects.filter(id=value, user=request.user).exists():
            raise serializers.ValidationError('You can only request assistance for your own vehicle.')
        return value


class AssignProviderSerializer(serializers.Serializer):
    provider_id = serializers.IntegerField()


class RejectRequestSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)


class CancelRequestSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
