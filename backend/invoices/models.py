from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel


class Invoice(TimeStampedModel):
    invoice_number = models.CharField(max_length=30, unique=True, db_index=True)
    request = models.OneToOneField('assistance.AssistanceRequest', on_delete=models.CASCADE, related_name='invoice')
    pdf_file = models.FileField(upload_to='invoices/', blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.invoice_number

    @staticmethod
    def generate_invoice_number():
        year = timezone.localdate().year
        prefix = f'INV-{year}-'
        last = Invoice.objects.filter(invoice_number__startswith=prefix).order_by('-invoice_number').first()
        next_seq = 1
        if last:
            try:
                next_seq = int(last.invoice_number.rsplit('-', 1)[-1]) + 1
            except ValueError:
                next_seq = 1
        return f'{prefix}{next_seq:04d}'
