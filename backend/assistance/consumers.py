import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from assistance.models import AssistanceRequest


class TrackingConsumer(AsyncJsonWebsocketConsumer):
    """
    /ws/requests/<request_id>/tracking/

    Broadcasts provider location + status/ETA updates to the customer and
    provider on a given request. Only the customer who owns the request or
    the assigned provider may connect — enforced server-side, never trusting
    the frontend.
    """

    async def connect(self):
        self.request_number = self.scope['url_route']['kwargs']['request_id']
        self.group_name = None
        user = self.scope.get('user')

        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return

        req = await self._get_authorized_request(user)
        if req is None:
            await self.close(code=4403)
            return

        self.group_name = f'tracking_{req.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({'type': 'connected', 'status': req.status})

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        """
        Providers push their live location while en route:
          { "type": "location_update", "latitude": .., "longitude": .. }
        """
        if content.get('type') != 'location_update':
            return

        user = self.scope['user']
        latitude = content.get('latitude')
        longitude = content.get('longitude')
        if latitude is None or longitude is None:
            return

        updated = await self._save_provider_location(user, latitude, longitude)
        if not updated:
            return

        await self.channel_layer.group_send(
            self.group_name,
            {'type': 'tracking.update', 'data': {'providerLocation': {'latitude': latitude, 'longitude': longitude}}},
        )

    async def tracking_update(self, event):
        await self.send_json({'type': 'tracking_update', **event['data']})

    @database_sync_to_async
    def _get_authorized_request(self, user):
        try:
            req = AssistanceRequest.objects.select_related('provider__user', 'customer').get(request_number=self.request_number)
        except AssistanceRequest.DoesNotExist:
            return None
        is_customer = req.customer_id == user.id
        is_provider = req.provider and req.provider.user_id == user.id
        return req if (is_customer or is_provider) else None

    @database_sync_to_async
    def _save_provider_location(self, user, latitude, longitude):
        from providers.models import ProviderLocation, ProviderProfile
        try:
            req = AssistanceRequest.objects.select_related('provider').get(request_number=self.request_number)
        except AssistanceRequest.DoesNotExist:
            return False
        if not req.provider or req.provider.user_id != user.id:
            return False
        ProviderLocation.objects.update_or_create(
            provider=req.provider, defaults={'latitude': latitude, 'longitude': longitude}
        )
        return True
