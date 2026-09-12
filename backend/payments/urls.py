from django.urls import path

from payments import views

urlpatterns = [
    path('create/', views.CreatePaymentView.as_view(), name='payment-create'),
    path('<int:pk>/process/', views.ProcessPaymentView.as_view(), name='payment-process'),
    path('', views.PaymentListView.as_view(), name='payment-list'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
]
