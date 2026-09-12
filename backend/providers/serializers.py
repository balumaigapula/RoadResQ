from rest_framework import serializers

from common.validators import validate_image_file
from providers.models import ProviderLocation, ProviderProfile


class ProviderProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    profile_image_upload = serializers.ImageField(write_only=True, required=False, source='profile_image')
    name = serializers.CharField(source='business_name', required=False)

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'business_name', 'name', 'description', 'service_types', 'experience_years',
            'profile_image', 'profile_image_upload', 'phone', 'email', 'address',
            'latitude', 'longitude', 'service_radius_km', 'rating', 'total_reviews',
            'completed_services', 'acceptance_rate', 'is_online', 'verification_status',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'rating', 'total_reviews', 'completed_services', 'acceptance_rate',
            'verification_status', 'is_online', 'created_at', 'updated_at',
        ]

    def get_profile_image(self, obj):
        if not obj.profile_image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url

    def validate_profile_image_upload(self, value):
        validate_image_file(value)
        return value


class ProviderLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderLocation
        fields = ['latitude', 'longitude', 'last_updated']
        read_only_fields = ['last_updated']


class OnlineStatusSerializer(serializers.Serializer):
    is_online = serializers.BooleanField()


class NearbyProviderSerializer(serializers.Serializer):
    """Shaped to match the frontend's providerService.getNearbyProviders()
    mock response exactly — id, name, profile_image, services, distance,
    rating, availability, eta, estimated_price, match_score."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    profile_image = serializers.CharField(allow_null=True)
    services = serializers.ListField(child=serializers.CharField())
    rating = serializers.FloatField()
    reviewsCount = serializers.IntegerField()
    experience = serializers.CharField()
    completedServices = serializers.IntegerField()
    available = serializers.BooleanField()
    estimatedPrice = serializers.CharField()
    location = serializers.DictField()
    distance = serializers.FloatField()
    etaMinutes = serializers.IntegerField()
    matchScore = serializers.IntegerField()
