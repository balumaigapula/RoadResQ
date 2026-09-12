from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.views import APIView

from assistance.models import AssistanceRequest, RequestStatus
from common.permissions import IsCustomer
from common.response import error, success
from notifications.services import notify
from payments.gateways import is_razorpay_configured
from payments.models import Payment, PaymentStatus
from payments.serializers import CreatePaymentSerializer, PaymentSerializer, ProcessPaymentSerializer


class CreatePaymentView(APIView):
    permission_classes = [IsCustomer]

    @transaction.atomic
    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Unable to create payment.', errors=serializer.errors, status=400)

        req = get_object_or_404(
            AssistanceRequest, request_number=serializer.validated_data['request_number'], customer=request.user
        )
        if req.status != RequestStatus.COMPLETED:
            return error('Payment can only be created for a completed service.', status=400)
        if hasattr(req, 'payment'):
            return success(data=PaymentSerializer(req.payment).data, message='Payment already exists for this request.')

        method = serializer.validated_data['payment_method']
        payment = Payment.objects.create(
            request=req, customer=request.user, provider=req.provider,
            service_charge=req.estimated_service_charge, travel_charge=req.travel_charge,
            parts_cost=req.parts_cost, additional_charge=req.additional_charge,
            total_amount=req.total_amount, payment_method=method,
            payment_status=PaymentStatus.PENDING,
        )

        # Cash/UPI are treated as confirmed at creation for this platform's
        # flow (money changes hands with the provider directly); ONLINE
        # requires an explicit /process/ call once a gateway is wired up.
        if method in ('CASH', 'UPI'):
            payment.payment_status = PaymentStatus.SUCCESS
            payment.paid_at = timezone.now()
            payment.save(update_fields=['payment_status', 'paid_at'])
            notify(recipient=request.user, title='Payment Successful',
                   message=f'₹{payment.total_amount} paid via {method} for request {req.request_number}.',
                   notification_type='PAYMENT_SUCCESSFUL', request=req)

        return success(data=PaymentSerializer(payment).data, message='Payment created.', status=201)


class ProcessPaymentView(APIView):
    permission_classes = [IsCustomer]

    @transaction.atomic
    def post(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk, customer=request.user)
        if payment.payment_method != 'ONLINE':
            return error('Only online payments require processing.', status=400)
        if not is_razorpay_configured():
            return error('Online payments are not yet configured on this server.', status=503)

        serializer = ProcessPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Invalid payment confirmation.', errors=serializer.errors, status=400)

        # Future: verify_payment_signature(...) against Razorpay before
        # marking SUCCESS. Never trust a bare "success" flag from the client.
        return error('Online payment verification is not implemented yet.', status=501)


class PaymentListView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        qs = Payment.objects.filter(customer=request.user)
        return success(data=PaymentSerializer(qs, many=True).data)


class PaymentDetailView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk, customer=request.user)
        return success(data=PaymentSerializer(payment).data)
