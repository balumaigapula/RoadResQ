"""
Business logic layer for assistance requests — kept out of views.py per
project requirement #63. Every function here is the single source of truth
for a given operation, wrapped in a transaction where it touches more than
one row, and is what both the REST views and (indirectly) the WebSocket
consumer rely on.
"""
from django.db import transaction
from django.utils import timezone

from assistance.models import ALLOWED_TRANSITIONS, AssistanceRequest, RequestPriority, RequestStatus
from assistance.pricing import calculate_charges
from notifications.services import notify
from providers.matching import estimate_eta_minutes, haversine_km
from providers.models import ProviderProfile


class TransitionError(Exception):
    pass


class AssignmentError(Exception):
    pass


@transaction.atomic
def create_request(customer, *, vehicle, service_category, problem_type='', problem_description='',
                    problem_image=None, latitude, longitude, address='', city='', state='', postal_code='',
                    priority=RequestPriority.NORMAL, provider=None, is_sos=False, emergency_type=''):

    if vehicle is not None and vehicle.user_id != customer.id:
        raise AssignmentError("You can only request assistance for your own vehicle.")

    distance_km = None
    eta_minutes = None
    if provider and provider.latitude is not None:
        distance_km = round(haversine_km(latitude, longitude, provider.latitude, provider.longitude), 2)
        eta_minutes = estimate_eta_minutes(distance_km)

    charges = calculate_charges(service_category, distance_km=distance_km, priority=priority)

    req = AssistanceRequest.objects.create(
        request_number=AssistanceRequest.generate_request_number(),
        customer=customer,
        provider=provider,
        vehicle=vehicle,
        service_category=service_category,
        problem_type=problem_type,
        problem_description=problem_description,
        problem_image=problem_image,
        priority=priority,
        is_sos=is_sos,
        emergency_type=emergency_type,
        latitude=latitude,
        longitude=longitude,
        address=address,
        city=city,
        state=state,
        postal_code=postal_code,
        estimated_distance_km=distance_km,
        estimated_eta_minutes=eta_minutes,
        status=RequestStatus.PROVIDER_ASSIGNED if provider else RequestStatus.SEARCHING,
        **charges,
    )

    if provider:
        notify(
            recipient=provider.user,
            title='New Request',
            message=f'New {req.get_service_category_display()} request ({req.request_number}) assigned to you.',
            notification_type='NEW_REQUEST',
            request=req,
        )
    return req


def create_sos_request(customer, *, vehicle, emergency_type, latitude, longitude, address='', description=''):
    return create_request(
        customer,
        vehicle=vehicle,
        service_category='TOWING' if emergency_type in ('accident', 'immobile') else 'MECHANIC',
        problem_description=description or f'SOS: {emergency_type}',
        latitude=latitude, longitude=longitude, address=address,
        priority=RequestPriority.CRITICAL,
        is_sos=True,
        emergency_type=emergency_type,
    )


@transaction.atomic
def assign_provider(req: AssistanceRequest, provider: ProviderProfile):
    if req.status not in (RequestStatus.REQUESTED, RequestStatus.SEARCHING):
        raise AssignmentError('This request is no longer assignable.')
    if provider.verification_status != ProviderProfile.VerificationStatus.APPROVED:
        raise AssignmentError('Provider is not approved.')
    if not provider.is_online:
        raise AssignmentError('Provider is not online.')
    if not provider.supports(req.service_category):
        raise AssignmentError('Provider does not support this service.')

    if req.latitude is not None and provider.latitude is not None:
        distance_km = round(haversine_km(req.latitude, req.longitude, provider.latitude, provider.longitude), 2)
        req.estimated_distance_km = distance_km
        req.estimated_eta_minutes = estimate_eta_minutes(distance_km)

    req.provider = provider
    req.status = RequestStatus.PROVIDER_ASSIGNED
    req.save()

    notify(
        recipient=provider.user, title='New Request',
        message=f'New {req.get_service_category_display()} request ({req.request_number}) assigned to you.',
        notification_type='NEW_REQUEST', request=req,
    )
    return req


@transaction.atomic
def transition_status(req: AssistanceRequest, new_status: str, *, actor=None):
    if not req.can_transition_to(new_status):
        raise TransitionError(f'Cannot move request from {req.status} to {new_status}.')

    req.status = new_status
    timestamp_field = {
        RequestStatus.ACCEPTED: 'accepted_at',
        RequestStatus.ON_THE_WAY: 'on_the_way_at',
        RequestStatus.ARRIVED: 'arrived_at',
        RequestStatus.REPAIRING: 'started_at',
        RequestStatus.COMPLETED: 'completed_at',
    }.get(new_status)
    if timestamp_field:
        setattr(req, timestamp_field, timezone.now())

    if new_status == RequestStatus.COMPLETED:
        req.recalculate_total()
        if req.provider:
            ProviderProfile.objects.filter(pk=req.provider_id).update(
                completed_services=req.provider.completed_services + 1
            )

    req.save()

    notification_map = {
        RequestStatus.ACCEPTED: ('PROVIDER_ACCEPTED', 'Provider Accepted', f'{req.provider.business_name} accepted your request.', req.customer),
        RequestStatus.ON_THE_WAY: ('PROVIDER_ON_THE_WAY', 'Provider On The Way', f'{req.provider.business_name} is on the way.', req.customer),
        RequestStatus.ARRIVED: ('PROVIDER_ARRIVED', 'Provider Arrived', f'{req.provider.business_name} has arrived at your location.', req.customer),
        RequestStatus.COMPLETED: ('SERVICE_COMPLETED', 'Service Completed', f'Your {req.get_service_category_display()} request has been completed.', req.customer),
    }
    entry = notification_map.get(new_status)
    if entry:
        notification_type, title, message, recipient = entry
        notify(recipient=recipient, title=title, message=message, notification_type=notification_type, request=req)

    broadcast_tracking_update(req)
    return req


@transaction.atomic
def accept_request(req: AssistanceRequest, provider: ProviderProfile):
    if req.provider_id != provider.id:
        raise AssignmentError('This request is not assigned to you.')
    return transition_status(req, RequestStatus.ACCEPTED)


@transaction.atomic
def reject_request(req: AssistanceRequest, provider: ProviderProfile, reason=''):
    if req.provider_id != provider.id:
        raise AssignmentError('This request is not assigned to you.')
    req.provider = None
    req.status = RequestStatus.SEARCHING
    req.save(update_fields=['provider', 'status'])
    notify(
        recipient=req.customer, title='Searching for another provider',
        message=f'{provider.business_name} was unable to take your request — we are finding another provider.',
        notification_type='PROVIDER_FOUND', request=req,
    )
    return req


@transaction.atomic
def cancel_request(req: AssistanceRequest, *, actor_role: str, reason: str = ''):
    if not req.can_transition_to(RequestStatus.CANCELLED):
        raise TransitionError('This request can no longer be cancelled.')

    req.status = RequestStatus.CANCELLED
    req.cancelled_at = timezone.now()
    req.cancelled_by = actor_role
    req.cancellation_reason = reason
    req.save()

    if actor_role == 'CUSTOMER' and req.provider:
        notify(
            recipient=req.provider.user, title='Customer Cancelled',
            message=f'{req.customer.get_full_name()} cancelled request {req.request_number}.',
            notification_type='CUSTOMER_CANCELLED', request=req,
        )
    elif actor_role == 'PROVIDER':
        notify(
            recipient=req.customer, title='Request Cancelled',
            message=f'Your request {req.request_number} was cancelled by the provider.',
            notification_type='CUSTOMER_CANCELLED', request=req,
        )
    broadcast_tracking_update(req)
    return req


def broadcast_tracking_update(req: AssistanceRequest):
    """Pushes a status/ETA update to anyone subscribed to this request's
    WebSocket tracking group. Safe no-op if channel layers aren't configured."""
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        layer = get_channel_layer()
        if not layer:
            return
        async_to_sync(layer.group_send)(
            f'tracking_{req.id}',
            {
                'type': 'tracking.update',
                'data': {
                    'status': req.status,
                    'etaMinutes': req.estimated_eta_minutes,
                    'distanceKm': float(req.estimated_distance_km) if req.estimated_distance_km else None,
                },
            },
        )
    except Exception:
        # Real-time push is a nice-to-have on top of the persisted status —
        # never let a broadcast failure break the underlying transition.
        pass
