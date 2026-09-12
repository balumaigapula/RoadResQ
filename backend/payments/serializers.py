from rest_framework import serializers

from payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    requestId = serializers.CharField(source='request.request_number', read_only=True)
    provider = serializers.CharField(source='provider.business_name', read_only=True)
    customer = serializers.CharField(source='customer.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'requestId', 'customer', 'provider', 'service_charge', 'travel_charge',
            'parts_cost', 'additional_charge', 'total_amount', 'payment_method',
            'payment_status', 'transaction_id', 'paid_at', 'created_at',
        ]


class CreatePaymentSerializer(serializers.Serializer):
    request_number = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=['CASH', 'UPI', 'ONLINE'])


class ProcessPaymentSerializer(serializers.Serializer):
    # For CASH/UPI this simply confirms success; for ONLINE this would carry
    # the Razorpay order/payment/signature triplet once integrated.
    gateway_order_id = serializers.CharField(required=False, allow_blank=True)
    gateway_payment_id = serializers.CharField(required=False, allow_blank=True)
    gateway_signature = serializers.CharField(required=False, allow_blank=True)
