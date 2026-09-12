"""
Server-side PDF invoice generation (reportlab — pure Python, no external
binary dependency like wkhtmltopdf/WeasyPrint's system libs required).
"""
import io

from django.core.files.base import ContentFile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from invoices.models import Invoice

NAVY = colors.HexColor('#141F35')
ORANGE = colors.HexColor('#FF5B1F')
GREY = colors.HexColor('#6B7484')


def get_or_create_invoice(assistance_request):
    invoice, created = Invoice.objects.get_or_create(
        request=assistance_request,
        defaults={'invoice_number': Invoice.generate_invoice_number()},
    )
    return invoice


def render_invoice_pdf(invoice) -> bytes:
    req = invoice.request
    payment = getattr(req, 'payment', None)

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    y = height - margin

    # Header band
    c.setFillColor(NAVY)
    c.rect(0, height - 30 * mm, width, 30 * mm, fill=1, stroke=0)
    c.setFillColor(ORANGE)
    c.setFont('Helvetica-Bold', 20)
    c.drawString(margin, height - 18 * mm, 'RoadResQ')
    c.setFillColor(colors.white)
    c.setFont('Helvetica', 8)
    c.drawString(margin, height - 24 * mm, 'HELP ON EVERY MILE')

    y = height - 40 * mm
    c.setFillColor(NAVY)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(margin, y, f'Invoice {invoice.invoice_number}')
    y -= 8 * mm

    c.setFont('Helvetica', 10)
    c.setFillColor(colors.black)
    rows = [
        ('Request ID', req.request_number),
        ('Customer', req.customer.get_full_name()),
        ('Provider', req.provider.business_name if req.provider else '—'),
        ('Vehicle', f'{req.vehicle.brand} {req.vehicle.model} ({req.vehicle.vehicle_number})' if req.vehicle else '—'),
        ('Service', req.get_service_category_display()),
        ('Date', invoice.created_at.strftime('%d %b %Y, %I:%M %p')),
        ('Payment Status', payment.payment_status if payment else 'UNPAID'),
    ]
    for label, value in rows:
        c.setFillColor(GREY)
        c.drawString(margin, y, f'{label}:')
        c.setFillColor(colors.black)
        c.drawString(margin + 45 * mm, y, str(value))
        y -= 7 * mm

    y -= 5 * mm
    c.setStrokeColor(colors.HexColor('#E1E5EA'))
    c.line(margin, y, width - margin, y)
    y -= 10 * mm

    c.setFont('Helvetica-Bold', 11)
    c.drawString(margin, y, 'Charges')
    y -= 8 * mm

    charge_rows = [
        ('Service Charge', req.estimated_service_charge),
        ('Travel Charge', req.travel_charge),
        ('Parts Cost', req.parts_cost),
        ('Additional Charges', req.additional_charge),
    ]
    c.setFont('Helvetica', 10)
    for label, amount in charge_rows:
        c.setFillColor(GREY)
        c.drawString(margin, y, label)
        c.setFillColor(colors.black)
        c.drawRightString(width - margin, y, f'Rs. {amount}')
        y -= 7 * mm

    y -= 3 * mm
    c.setStrokeColor(colors.HexColor('#E1E5EA'))
    c.line(margin, y, width - margin, y)
    y -= 10 * mm

    c.setFont('Helvetica-Bold', 13)
    c.setFillColor(NAVY)
    c.drawString(margin, y, 'Total')
    c.drawRightString(width - margin, y, f'Rs. {req.total_amount}')

    c.showPage()
    c.save()
    return buffer.getvalue()


def generate_and_save_pdf(invoice) -> Invoice:
    pdf_bytes = render_invoice_pdf(invoice)
    invoice.pdf_file.save(f'{invoice.invoice_number}.pdf', ContentFile(pdf_bytes), save=True)
    return invoice
