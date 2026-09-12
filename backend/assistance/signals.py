from django.db.models.signals import post_save
from django.dispatch import receiver

from assistance.models import AssistanceRequest
from notifications.services import notify


@receiver(post_save, sender=AssistanceRequest)
def notify_customer_on_creation(sender, instance, created, **kwargs):
    if created:
        notify(
            recipient=instance.customer,
            title='Request Received',
            message=f'Your assistance request {instance.request_number} has been received.',
            notification_type='REQUEST_RECEIVED',
            request=instance,
        )
