from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from common.response import success
from notifications.models import Notification
from notifications.serializers import NotificationSerializer


class NotificationListView(APIView):
    def get(self, request):
        qs = Notification.objects.filter(recipient=request.user)
        return success(data=NotificationSerializer(qs, many=True).data)


class MarkNotificationReadView(APIView):
    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return success(message='Notification marked as read.')


class MarkAllNotificationsReadView(APIView):
    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return success(message='All notifications marked as read.')
