from django.db.models import Q
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.permissions import IsProvider
from common.response import error, success
from providers.matching import compute_match_score, estimate_eta_minutes, haversine_km
from providers.models import ProviderLocation, ProviderProfile
from providers.serializers import (
    NearbyProviderSerializer, OnlineStatusSerializer, ProviderLocationSerializer,
    ProviderProfileSerializer,
)
from services.models import SERVICE_BASE_CHARGE


class MyProviderProfileView(APIView):
    permission_classes = [IsProvider]

    def get(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(
            user=request.user, defaults={'business_name': request.user.get_full_name() or 'My Business'}
        )
        return success(data=ProviderProfileSerializer(profile, context={'request': request}).data)

    def patch(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(user=request.user, defaults={'business_name': request.user.get_full_name()})
        serializer = ProviderProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if not serializer.is_valid():
            return error('Unable to update provider profile.', errors=serializer.errors, status=400)
        serializer.save()
        return success(data=serializer.data, message='Provider profile updated successfully.')


class ProviderLocationView(APIView):
    permission_classes = [IsProvider]

    def get(self, request):
        try:
            location = request.user.provider_profile.live_location
        except (ProviderProfile.DoesNotExist, ProviderLocation.DoesNotExist):
            return error('No location recorded yet.', status=404)
        return success(data=ProviderLocationSerializer(location).data)

    def post(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(user=request.user, defaults={'business_name': request.user.get_full_name()})
        serializer = ProviderLocationSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid location data.', errors=serializer.errors, status=400)

        location, _ = ProviderLocation.objects.update_or_create(
            provider=profile, defaults=serializer.validated_data
        )
        # Keep the profile's resting location roughly in sync too.
        ProviderProfile.objects.filter(pk=profile.pk).update(
            latitude=serializer.validated_data['latitude'], longitude=serializer.validated_data['longitude']
        )
        return success(data=ProviderLocationSerializer(location).data, message='Location updated.')


class ProviderStatusView(APIView):
    permission_classes = [IsProvider]

    def post(self, request):
        serializer = OnlineStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid request.', errors=serializer.errors, status=400)

        profile, _ = ProviderProfile.objects.get_or_create(user=request.user, defaults={'business_name': request.user.get_full_name()})
        if serializer.validated_data['is_online'] and profile.verification_status != ProviderProfile.VerificationStatus.APPROVED:
            return error('Your provider account must be approved before going online.', status=403)

        profile.is_online = serializer.validated_data['is_online']
        profile.save(update_fields=['is_online'])
        return success(data={'is_online': profile.is_online}, message='Status updated.')


def _price_range(service_types):
    if not service_types:
        return '₹200 – ₹800'
    charges = [SERVICE_BASE_CHARGE.get(s, 300) for s in service_types]
    return f'₹{min(charges)} – ₹{max(charges) * 3}'


class NearbyProvidersView(APIView):
    """
    GET /api/providers/nearby/?latitude=..&longitude=..&service_type=..&radius=..

    Real haversine distance + a backend-computed match score. Only APPROVED
    providers are ever returned; ONLINE ones are ranked ahead but offline
    approved providers still show (as unavailable) so the list isn't empty
    outside business hours, matching the frontend's existing UI which shows
    a "Busy" state rather than hiding providers entirely.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            latitude = float(request.query_params['latitude'])
            longitude = float(request.query_params['longitude'])
        except (KeyError, ValueError):
            return error('latitude and longitude are required query parameters.', status=400)

        service_type = request.query_params.get('service_type')
        radius = float(request.query_params.get('radius', 25))

        queryset = ProviderProfile.objects.filter(
            verification_status=ProviderProfile.VerificationStatus.APPROVED,
            latitude__isnull=False, longitude__isnull=False,
        )
        results = []
        for provider in queryset.select_related('user'):
            if service_type and service_type not in (provider.service_types or []):
                continue
            distance = haversine_km(latitude, longitude, provider.latitude, provider.longitude)
            if distance > radius:
                continue
            eta = estimate_eta_minutes(distance)
            score = compute_match_score(distance, provider.rating, provider.is_available, provider.acceptance_rate)
            results.append({
                'id': provider.id,
                'name': provider.business_name,
                'profile_image': request.build_absolute_uri(provider.profile_image.url) if provider.profile_image else None,
                'services': provider.service_types,
                'rating': float(provider.rating),
                'reviewsCount': provider.total_reviews,
                'experience': f'{provider.experience_years} years',
                'completedServices': provider.completed_services,
                'available': provider.is_available,
                'estimatedPrice': _price_range(provider.service_types),
                'location': {'latitude': float(provider.latitude), 'longitude': float(provider.longitude)},
                'distance': round(distance, 1),
                'etaMinutes': eta,
                'matchScore': score,
            })

        results.sort(key=lambda r: r['matchScore'], reverse=True)
        serializer = NearbyProviderSerializer(results, many=True)
        return success(data=serializer.data)


class ProviderPublicDetailView(APIView):
    """GET /api/providers/<id>/ — used by the customer-facing ProviderDetails page."""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            provider = ProviderProfile.objects.get(pk=pk, verification_status=ProviderProfile.VerificationStatus.APPROVED)
        except ProviderProfile.DoesNotExist:
            return error('Provider not found.', status=404)

        lat = request.query_params.get('latitude')
        lng = request.query_params.get('longitude')
        distance = None
        eta = None
        if lat and lng and provider.latitude is not None:
            distance = round(haversine_km(float(lat), float(lng), provider.latitude, provider.longitude), 1)
            eta = estimate_eta_minutes(distance)

        data = ProviderProfileSerializer(provider, context={'request': request}).data
        data['distance'] = distance
        data['etaMinutes'] = eta
        data['estimatedPrice'] = _price_range(provider.service_types)
        data['available'] = provider.is_available
        return success(data=data)
