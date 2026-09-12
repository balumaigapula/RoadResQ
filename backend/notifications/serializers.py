from rest_framework import serializers

from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    request_number = serializers.CharField(source='request.request_number', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'request_number', 'is_read', 'created_at']
