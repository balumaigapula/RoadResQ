"""Single entry point for creating notifications, used by every app that
needs to notify a user (assistance, payments, reviews, providers)."""
from notifications.models import Notification


def notify(*, recipient, title, message, notification_type, request=None):
    return Notification.objects.create(
        recipient=recipient, title=title, message=message,
        notification_type=notification_type, request=request,
    )
