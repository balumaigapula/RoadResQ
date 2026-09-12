from django.urls import path

from services.views import ProblemTypeListView, ServiceCategoryListView

urlpatterns = [
    path('categories/', ServiceCategoryListView.as_view(), name='service-categories'),
    path('problem-types/', ProblemTypeListView.as_view(), name='problem-types'),
]
