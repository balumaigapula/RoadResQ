from django.urls import path

from assistance import views

urlpatterns = [
    path('requests/', views.CustomerRequestListView.as_view(), name='customer-requests'),
    path('requests/<str:request_number>/', views.CustomerRequestDetailView.as_view(), name='customer-request-detail'),
    path('requests/<str:request_number>/cancel/', views.CustomerCancelRequestView.as_view(), name='customer-request-cancel'),
    path('history/', views.CustomerHistoryListView.as_view(), name='customer-history'),
    path('history/<str:request_number>/', views.CustomerHistoryDetailView.as_view(), name='customer-history-detail'),
]
