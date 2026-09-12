from rest_framework import serializers

from common.validators import validate_image_file
from vehicles.models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_upload = serializers.ImageField(write_only=True, required=False, source='image')

    class Meta:
        model = Vehicle
        fields = [
            'id', 'vehicle_type', 'vehicle_number', 'brand', 'model', 'fuel_type',
            'year', 'image', 'image_upload', 'is_primary', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

    def validate_image_upload(self, value):
        validate_image_file(value)
        return value
