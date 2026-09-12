from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from assistance.models import AssistanceRequest, RequestStatus
from common.response import error, success
from invoices.models import Invoice
from invoices.pdf import generate_and_save_pdf, get_or_create_invoice
from invoices.serializers import InvoiceSerializer


def _owns_invoice(user, invoice):
    req = invoice.request
    return req.customer_id == user.id or (req.provider and req.provider.user_id == user.id) or user.role == 'ADMIN'


class InvoiceDetailView(APIView):
    def get(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        if not _owns_invoice(request.user, invoice):
            return error('You do not have access to this invoice.', status=403)
        return success(data=InvoiceSerializer(invoice, context={'request': request}).data)


class InvoiceByRequestView(APIView):
    """GET /api/invoices/by-request/<request_number>/ — creates the invoice
    on first access if the request is completed but no invoice exists yet."""
    def get(self, request, request_number):
        req = get_object_or_404(AssistanceRequest, request_number=request_number)
        if not (req.customer_id == request.user.id or (req.provider and req.provider.user_id == request.user.id) or request.user.role == 'ADMIN'):
            return error('You do not have access to this invoice.', status=403)
        if req.status != RequestStatus.COMPLETED:
            return error('Invoice is only available for completed requests.', status=400)

        invoice = get_or_create_invoice(req)
        return success(data=InvoiceSerializer(invoice, context={'request': request}).data)


class InvoicePDFView(APIView):
    def get(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        if not _owns_invoice(request.user, invoice):
            return error('You do not have access to this invoice.', status=403)
        if not invoice.pdf_file:
            generate_and_save_pdf(invoice)
            invoice.refresh_from_db()
        return FileResponse(invoice.pdf_file.open('rb'), content_type='application/pdf', filename=f'{invoice.invoice_number}.pdf')
