from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from assistance import services
from assistance.models import AssistanceRequest, RequestStatus
from assistance.serializers import (
    AssignProviderSerializer, AssistanceRequestSerializer, CancelRequestSerializer,
    CreateAssistanceRequestSerializer, RejectRequestSerializer, SOSRequestSerializer,
)
from common.permissions import IsApprovedProvider, IsCustomer, IsProvider
from common.response import error, success
from providers.models import ProviderProfile
from vehicles.models import Vehicle

ACTIVE_STATUSES = [
    RequestStatus.SEARCHING, RequestStatus.PROVIDER_ASSIGNED, RequestStatus.ACCEPTED,
    RequestStatus.ON_THE_WAY, RequestStatus.ARRIVED, RequestStatus.REPAIRING,
]


def _serialize(req, request):
    return AssistanceRequestSerializer(req, context={'request': request}).data


# ---------------------------------------------------------------------------
# Creation (customer)
# ---------------------------------------------------------------------------

class CreateAssistanceRequestView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request):
        serializer = CreateAssistanceRequestSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error('Unable to create request.', errors=serializer.errors, status=400)
        data = serializer.validated_data

        vehicle = Vehicle.objects.filter(id=data.get('vehicle_id'), user=request.user).first() if data.get('vehicle_id') else None
        provider = ProviderProfile.objects.filter(id=data.get('provider_id')).first() if data.get('provider_id') else None

        try:
            req = services.create_request(
                request.user,
                vehicle=vehicle,
                service_category=data['service_category'],
                problem_type=data.get('problem_type', ''),
                problem_description=data.get('problem_description', ''),
                problem_image=data.get('problem_image'),
                latitude=data['latitude'], longitude=data['longitude'],
                address=data.get('address', ''), city=data.get('city', ''),
                state=data.get('state', ''), postal_code=data.get('postal_code', ''),
                priority=data.get('priority', 'NORMAL'),
                provider=provider,
            )
        except services.AssignmentError as exc:
            return error(str(exc), status=400)

        return success(data=_serialize(req, request), message='Request created successfully.', status=201)


class SOSRequestView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request):
        serializer = SOSRequestSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error('Unable to create SOS request.', errors=serializer.errors, status=400)
        data = serializer.validated_data
        vehicle = Vehicle.objects.filter(id=data.get('vehicle_id'), user=request.user).first() if data.get('vehicle_id') else None

        req = services.create_sos_request(
            request.user, vehicle=vehicle, emergency_type=data['emergency_type'],
            latitude=data['latitude'], longitude=data['longitude'],
            address=data.get('address', ''), description=data.get('description', ''),
        )
        return success(data=_serialize(req, request), message='Emergency request sent. Help is on the way.', status=201)


class AssignProviderView(APIView):
    """Used by dispatch logic / admin tooling to explicitly assign a provider
    to a SEARCHING request (e.g. after the customer picked one from the
    nearby-providers list)."""
    permission_classes = [IsCustomer]

    def post(self, request, request_number):
        req = get_object_or_404(AssistanceRequest, request_number=request_number, customer=request.user)
        serializer = AssignProviderSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid request.', errors=serializer.errors, status=400)

        provider = get_object_or_404(ProviderProfile, id=serializer.validated_data['provider_id'])
        try:
            req = services.assign_provider(req, provider)
        except services.AssignmentError as exc:
            return error(str(exc), status=400)
        return success(data=_serialize(req, request), message='Provider assigned.')


# ---------------------------------------------------------------------------
# Customer-facing request management
# ---------------------------------------------------------------------------

class CustomerRequestListView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        qs = AssistanceRequest.objects.filter(customer=request.user)
        tab = request.query_params.get('tab')
        if tab == 'active':
            qs = qs.filter(status__in=ACTIVE_STATUSES)
        elif tab == 'pending':
            qs = qs.filter(status__in=[RequestStatus.REQUESTED, RequestStatus.SEARCHING])
        elif tab == 'completed':
            qs = qs.filter(status=RequestStatus.COMPLETED)
        elif tab == 'cancelled':
            qs = qs.filter(status=RequestStatus.CANCELLED)
        return success(data=AssistanceRequestSerializer(qs, many=True, context={'request': request}).data)


class CustomerRequestDetailView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request, request_number):
        req = get_object_or_404(AssistanceRequest, request_number=request_number, customer=request.user)
        return success(data=_serialize(req, request))


class CustomerCancelRequestView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request, request_number):
        req = get_object_or_404(AssistanceRequest, request_number=request_number, customer=request.user)
        serializer = CancelRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=False)
        try:
            req = services.cancel_request(req, actor_role='CUSTOMER', reason=serializer.validated_data.get('reason', '') if serializer.is_valid() else '')
        except services.TransitionError as exc:
            return error(str(exc), status=400)
        return success(data=_serialize(req, request), message='Request cancelled.')


class CustomerHistoryListView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        qs = AssistanceRequest.objects.filter(customer=request.user, status=RequestStatus.COMPLETED)
        return success(data=AssistanceRequestSerializer(qs, many=True, context={'request': request}).data)


class CustomerHistoryDetailView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request, request_number):
        req = get_object_or_404(AssistanceRequest, request_number=request_number, customer=request.user, status=RequestStatus.COMPLETED)
        return success(data=_serialize(req, request))


# ---------------------------------------------------------------------------
# Provider-facing request management
# ---------------------------------------------------------------------------

def _provider_profile(request):
    return getattr(request.user, 'provider_profile', None)


class ProviderRequestListView(APIView):
    permission_classes = [IsProvider]

    def get(self, request):
        profile = _provider_profile(request)
        if not profile:
            return success(data=[])
        qs = AssistanceRequest.objects.filter(provider=profile, status=RequestStatus.PROVIDER_ASSIGNED)
        return success(data=AssistanceRequestSerializer(qs, many=True, context={'request': request}).data)


class ProviderRequestDetailView(APIView):
    permission_classes = [IsProvider]

    def get(self, request, request_number):
        profile = _provider_profile(request)
        req = get_object_or_404(AssistanceRequest, request_number=request_number, provider=profile)
        return success(data=_serialize(req, request))


class ProviderAcceptView(APIView):
    permission_classes = [IsApprovedProvider]

    def post(self, request, request_number):
        profile = _provider_profile(request)
        req = get_object_or_404(AssistanceRequest, request_number=request_number, provider=profile)
        try:
            req = services.accept_request(req, profile)
        except (services.AssignmentError, services.TransitionError) as exc:
            return error(str(exc), status=400)
        return success(data=_serialize(req, request), message='Request accepted.')


class ProviderRejectView(APIView):
    permission_classes = [IsProvider]

    def post(self, request, request_number):
        profile = _provider_profile(request)
        req = get_object_or_404(AssistanceRequest, request_number=request_number, provider=profile)
        serializer = RejectRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=False)
        try:
            req = services.reject_request(req, profile, reason=serializer.validated_data.get('reason', '') if serializer.is_valid() else '')
        except services.AssignmentError as exc:
            return error(str(exc), status=400)
        return success(message='Request declined.')


def _make_status_view(target_status):
    class _StatusView(APIView):
        permission_classes = [IsApprovedProvider]

        def post(self, request, request_number):
            profile = _provider_profile(request)
            req = get_object_or_404(AssistanceRequest, request_number=request_number, provider=profile)
            try:
                req = services.transition_status(req, target_status)
            except services.TransitionError as exc:
                return error(str(exc), status=400)
            return success(data=_serialize(req, request), message=f'Status updated to {target_status}.')
    return _StatusView


ProviderOnTheWayView = _make_status_view(RequestStatus.ON_THE_WAY)
ProviderArrivedView = _make_status_view(RequestStatus.ARRIVED)
ProviderStartView = _make_status_view(RequestStatus.REPAIRING)
ProviderCompleteView = _make_status_view(RequestStatus.COMPLETED)


class ProviderActiveServiceView(APIView):
    permission_classes = [IsProvider]

    def get(self, request):
        profile = _provider_profile(request)
        if not profile:
            return error('No active service.', status=404)
        req = AssistanceRequest.objects.filter(
            provider=profile,
            status__in=[RequestStatus.ACCEPTED, RequestStatus.ON_THE_WAY, RequestStatus.ARRIVED, RequestStatus.REPAIRING],
        ).order_by('-accepted_at').first()
        if not req:
            return error('No active service right now.', status=404)
        return success(data=_serialize(req, request))


class ProviderHistoryListView(APIView):
    permission_classes = [IsProvider]

    def get(self, request):
        profile = _provider_profile(request)
        qs = AssistanceRequest.objects.filter(provider=profile, status=RequestStatus.COMPLETED) if profile else AssistanceRequest.objects.none()
        return success(data=AssistanceRequestSerializer(qs, many=True, context={'request': request}).data)
