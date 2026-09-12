from rest_framework import serializers

from assistance.models import AssistanceRequest, RequestStatus
from reviews.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    customer = serializers.CharField(source='customer.get_full_name', read_only=True)
    provider = serializers.CharField(source='provider.business_name', read_only=True)
    requestId = serializers.CharField(source='request.request_number', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'requestId', 'customer', 'provider', 'rating', 'comment', 'created_at']


class CreateReviewSerializer(serializers.Serializer):
    request_number = serializers.CharField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_request_number(self, value):
        request = self.context['request']
        try:
            req = AssistanceRequest.objects.get(request_number=value, customer=request.user)
        except AssistanceRequest.DoesNotExist:
            raise serializers.ValidationError('Request not found.')
        if req.status != RequestStatus.COMPLETED:
            raise serializers.ValidationError('Only completed requests can be reviewed.')
        if hasattr(req, 'review'):
            raise serializers.ValidationError('This request has already been reviewed.')
        self._request_obj = req
        return value
