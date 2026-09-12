from rest_framework import viewsets
from rest_framework.decorators import action

from common.permissions import IsCustomer
from common.response import error, success
from vehicles.models import Vehicle
from vehicles.serializers import VehicleSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for a customer's own vehicles.
    GET/POST   /api/vehicles/
    GET/PUT/PATCH/DELETE /api/vehicles/<id>/
    """
    serializer_class = VehicleSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Vehicle.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error('Unable to add vehicle.', errors=serializer.errors, status=400)
        vehicle = serializer.save(user=request.user)
        return success(data=self.get_serializer(vehicle).data, message='Vehicle added successfully.', status=201)

    def retrieve(self, request, *args, **kwargs):
        return success(data=self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return error('Unable to update vehicle.', errors=serializer.errors, status=400)
        serializer.save()
        return success(data=serializer.data, message='Vehicle updated successfully.')

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return success(message='Vehicle removed.')

    @action(detail=True, methods=['post'], url_path='set-primary')
    def set_primary(self, request, pk=None):
        vehicle = self.get_object()
        Vehicle.objects.filter(user=request.user).update(is_primary=False)
        vehicle.is_primary = True
        vehicle.save(update_fields=['is_primary'])
        return success(data=self.get_serializer(vehicle).data, message='Primary vehicle updated.')
