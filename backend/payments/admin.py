from django.contrib import admin

from payments.models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'request', 'customer', 'provider', 'total_amount', 'payment_method', 'payment_status', 'created_at']
    list_filter = ['payment_method', 'payment_status']
    search_fields = ['transaction_id', 'customer__email', 'request__request_number']
