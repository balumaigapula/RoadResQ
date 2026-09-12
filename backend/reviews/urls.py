from django.urls import path

from reviews import views

urlpatterns = [
    path('', views.CreateReviewView.as_view(), name='review-create'),
    path('provider/<int:provider_id>/', views.ProviderReviewListView.as_view(), name='provider-reviews'),
]
