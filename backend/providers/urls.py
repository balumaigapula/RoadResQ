from django.urls import path

from providers import views

urlpatterns = [
    path('me/', views.MyProviderProfileView.as_view(), name='provider-me'),
    path('location/', views.ProviderLocationView.as_view(), name='provider-location'),
    path('status/', views.ProviderStatusView.as_view(), name='provider-status'),
    path('nearby/', views.NearbyProvidersView.as_view(), name='provider-nearby'),
    path('<int:pk>/', views.ProviderPublicDetailView.as_view(), name='provider-detail'),
]
