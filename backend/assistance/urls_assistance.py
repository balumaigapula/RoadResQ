from django.urls import path

from assistance import views

urlpatterns = [
    path('requests/', views.CreateAssistanceRequestView.as_view(), name='create-request'),
    path('requests/<str:request_number>/assign-provider/', views.AssignProviderView.as_view(), name='assign-provider'),
    path('sos/', views.SOSRequestView.as_view(), name='sos'),
]
