from django.urls import path

from invoices import views

urlpatterns = [
    path('by-request/<str:request_number>/', views.InvoiceByRequestView.as_view(), name='invoice-by-request'),
    path('<int:pk>/', views.InvoiceDetailView.as_view(), name='invoice-detail'),
    path('<int:pk>/download/', views.InvoicePDFView.as_view(), name='invoice-download'),
]
