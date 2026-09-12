from django.contrib import admin

from assistance.models import AssistanceRequest


@admin.register(AssistanceRequest)
class AssistanceRequestAdmin(admin.ModelAdmin):
    list_display = ['request_number', 'customer', 'provider', 'service_category', 'status', 'priority', 'total_amount', 'created_at']
    list_filter = ['status', 'priority', 'service_category', 'is_sos']
    search_fields = ['request_number', 'customer__email', 'provider__business_name']
    readonly_fields = ['request_number', 'created_at', 'updated_at']
    ordering = ['-created_at']
