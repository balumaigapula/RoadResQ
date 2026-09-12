from django.urls import path

from assistance import views

urlpatterns = [
    path('requests/', views.ProviderRequestListView.as_view(), name='provider-requests'),
    path('requests/<str:request_number>/', views.ProviderRequestDetailView.as_view(), name='provider-request-detail'),
    path('requests/<str:request_number>/accept/', views.ProviderAcceptView.as_view(), name='provider-request-accept'),
    path('requests/<str:request_number>/reject/', views.ProviderRejectView.as_view(), name='provider-request-reject'),
    path('requests/<str:request_number>/on-the-way/', views.ProviderOnTheWayView.as_view(), name='provider-request-otw'),
    path('requests/<str:request_number>/arrived/', views.ProviderArrivedView.as_view(), name='provider-request-arrived'),
    path('requests/<str:request_number>/start/', views.ProviderStartView.as_view(), name='provider-request-start'),
    path('requests/<str:request_number>/complete/', views.ProviderCompleteView.as_view(), name='provider-request-complete'),
    path('active-service/', views.ProviderActiveServiceView.as_view(), name='provider-active-service'),
    path('history/', views.ProviderHistoryListView.as_view(), name='provider-history'),
]
