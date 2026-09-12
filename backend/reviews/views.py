from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.permissions import IsCustomer
from common.response import error, success
from providers.models import ProviderProfile
from reviews.models import Review
from reviews.serializers import CreateReviewSerializer, ReviewSerializer


class CreateReviewView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request):
        serializer = CreateReviewSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error('Unable to submit review.', errors=serializer.errors, status=400)

        req = serializer._request_obj
        review = Review.objects.create(
            request=req, customer=request.user, provider=req.provider,
            rating=serializer.validated_data['rating'], comment=serializer.validated_data.get('comment', ''),
        )
        return success(data=ReviewSerializer(review).data, message='Review submitted successfully.', status=201)


class ProviderReviewListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider_id):
        qs = Review.objects.filter(provider_id=provider_id).select_related('customer', 'provider')
        return success(data=ReviewSerializer(qs, many=True).data)


class CustomerReviewListView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        qs = Review.objects.filter(customer=request.user).select_related('provider')
        return success(data=ReviewSerializer(qs, many=True).data)
