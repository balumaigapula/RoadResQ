from django.contrib import admin

from vehicles.models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['vehicle_number', 'brand', 'model', 'user', 'vehicle_type', 'is_primary', 'created_at']
    list_filter = ['vehicle_type', 'fuel_type', 'is_primary']
    search_fields = ['vehicle_number', 'brand', 'model', 'user__email']
