from django.urls import path

from dashboard import views

urlpatterns = [
    path('dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),

    path('users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),

    path('providers/', views.AdminProviderListView.as_view(), name='admin-providers'),
    path('providers/<int:pk>/', views.AdminProviderDetailView.as_view(), name='admin-provider-detail'),
    path('providers/<int:pk>/approve/', views.AdminApproveProviderView.as_view(), name='admin-provider-approve'),
    path('providers/<int:pk>/reject/', views.AdminRejectProviderView.as_view(), name='admin-provider-reject'),
    path('providers/<int:pk>/suspend/', views.AdminSuspendProviderView.as_view(), name='admin-provider-suspend'),

    path('requests/', views.AdminRequestListView.as_view(), name='admin-requests'),
    path('requests/<str:request_number>/', views.AdminRequestDetailView.as_view(), name='admin-request-detail'),

    path('payments/', views.AdminPaymentListView.as_view(), name='admin-payments'),
    path('reviews/', views.AdminReviewListView.as_view(), name='admin-reviews'),
]
