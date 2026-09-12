from rest_framework import serializers

from invoices.models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    requestId = serializers.CharField(source='request.request_number', read_only=True)
    customer = serializers.CharField(source='request.customer.get_full_name', read_only=True)
    provider = serializers.CharField(source='request.provider.business_name', read_only=True, default=None)
    vehicle = serializers.SerializerMethodField()
    service = serializers.CharField(source='request.get_service_category_display', read_only=True)
    charges = serializers.SerializerMethodField()
    total = serializers.DecimalField(source='request.total_amount', max_digits=10, decimal_places=2, read_only=True)
    paymentStatus = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'requestId', 'customer', 'provider', 'vehicle', 'service',
                   'charges', 'total', 'paymentStatus', 'pdf_url', 'created_at']

    def get_vehicle(self, obj):
        v = obj.request.vehicle
        return f'{v.brand} {v.model} · {v.vehicle_number}' if v else '—'

    def get_charges(self, obj):
        r = obj.request
        return {
            'serviceCharge': r.estimated_service_charge, 'travelCharge': r.travel_charge,
            'partsCost': r.parts_cost, 'additional': r.additional_charge,
        }

    def get_paymentStatus(self, obj):
        payment = getattr(obj.request, 'payment', None)
        return payment.payment_status if payment else 'UNPAID'

    def get_pdf_url(self, obj):
        if not obj.pdf_file:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.pdf_file.url) if request else obj.pdf_file.url
