from datetime import timedelta

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView

from accounts.models import User
from accounts.serializers import UserSerializer
from assistance.models import AssistanceRequest, RequestStatus
from common.permissions import IsAdminRole
from common.response import error, success
from payments.models import Payment, PaymentStatus
from payments.serializers import PaymentSerializer
from providers.models import ProviderProfile
from providers.serializers import ProviderProfileSerializer
from reviews.models import Review
from reviews.serializers import ReviewSerializer


class AdminDashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_providers = ProviderProfile.objects.count()
        active_requests = AssistanceRequest.objects.exclude(
            status__in=[RequestStatus.COMPLETED, RequestStatus.CANCELLED]
        ).count()
        completed_requests = AssistanceRequest.objects.filter(status=RequestStatus.COMPLETED).count()
        cancelled_requests = AssistanceRequest.objects.filter(status=RequestStatus.CANCELLED).count()
        total_revenue = Payment.objects.filter(payment_status=PaymentStatus.SUCCESS).aggregate(s=Sum('total_amount'))['s'] or 0
        average_rating = ProviderProfile.objects.filter(total_reviews__gt=0).aggregate(a=Avg('rating'))['a'] or 0

        since = timezone.now() - timedelta(days=13)
        requests_over_time = list(
            AssistanceRequest.objects.filter(created_at__gte=since)
            .annotate(day=TruncDate('created_at')).values('day')
            .annotate(count=Count('id')).order_by('day')
        )
        revenue_over_time = list(
            Payment.objects.filter(payment_status=PaymentStatus.SUCCESS, created_at__gte=since)
            .annotate(day=TruncDate('created_at')).values('day')
            .annotate(total=Sum('total_amount')).order_by('day')
        )
        service_category_distribution = list(
            AssistanceRequest.objects.values('service_category').annotate(count=Count('id')).order_by('-count')
        )
        provider_performance = list(
            ProviderProfile.objects.order_by('-completed_services')[:10]
            .values('business_name', 'completed_services', 'rating', 'acceptance_rate')
        )
        peak_hours = list(
            AssistanceRequest.objects.annotate(hour=TruncDate('created_at'))
            .values('created_at__hour').annotate(count=Count('id')).order_by('created_at__hour')
        )
        top_locations = list(
            AssistanceRequest.objects.exclude(city='').values('city').annotate(count=Count('id')).order_by('-count')[:10]
        )

        return success(data={
            'total_customers': total_customers,
            'total_providers': total_providers,
            'active_requests': active_requests,
            'completed_requests': completed_requests,
            'cancelled_requests': cancelled_requests,
            'total_revenue': total_revenue,
            'average_rating': round(float(average_rating), 2),
            'analytics': {
                'requests_over_time': requests_over_time,
                'revenue_over_time': revenue_over_time,
                'service_category_distribution': service_category_distribution,
                'provider_performance': provider_performance,
                'peak_hours': peak_hours,
                'top_locations': top_locations,
            },
        })


class AdminUserListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = User.objects.filter(role=User.Role.CUSTOMER).order_by('-created_at')
        return success(data=UserSerializer(qs, many=True, context={'request': request}).data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return success(data=UserSerializer(user, context={'request': request}).data)

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        is_active = request.data.get('is_active')
        if is_active is not None:
            user.is_active = bool(is_active)
            user.save(update_fields=['is_active'])
        return success(data=UserSerializer(user, context={'request': request}).data, message='User updated.')


class AdminProviderListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = ProviderProfile.objects.select_related('user').order_by('-created_at')
        return success(data=ProviderProfileSerializer(qs, many=True, context={'request': request}).data)


class AdminProviderDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        provider = get_object_or_404(ProviderProfile, pk=pk)
        return success(data=ProviderProfileSerializer(provider, context={'request': request}).data)


def _make_verification_view(new_status, extra_updates=None):
    class _VerificationView(APIView):
        permission_classes = [IsAdminRole]

        def post(self, request, pk):
            provider = get_object_or_404(ProviderProfile, pk=pk)
            provider.verification_status = new_status
            if extra_updates:
                for field, value in extra_updates.items():
                    setattr(provider, field, value)
            provider.save()
            return success(data=ProviderProfileSerializer(provider, context={'request': request}).data,
                           message=f'Provider {new_status.lower()}.')
    return _VerificationView


AdminApproveProviderView = _make_verification_view(ProviderProfile.VerificationStatus.APPROVED)
AdminRejectProviderView = _make_verification_view(ProviderProfile.VerificationStatus.REJECTED)
AdminSuspendProviderView = _make_verification_view(ProviderProfile.VerificationStatus.SUSPENDED, {'is_online': False})


class AdminRequestListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        from assistance.serializers import AssistanceRequestSerializer
        qs = AssistanceRequest.objects.select_related('customer', 'provider').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return success(data=AssistanceRequestSerializer(qs, many=True, context={'request': request}).data)


class AdminRequestDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, request_number):
        from assistance.serializers import AssistanceRequestSerializer
        req = get_object_or_404(AssistanceRequest, request_number=request_number)
        return success(data=AssistanceRequestSerializer(req, context={'request': request}).data)


class AdminPaymentListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = Payment.objects.select_related('customer', 'provider', 'request').order_by('-created_at')
        return success(data=PaymentSerializer(qs, many=True).data)


class AdminReviewListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = Review.objects.select_related('customer', 'provider').order_by('-created_at')
        return success(data=ReviewSerializer(qs, many=True).data)
