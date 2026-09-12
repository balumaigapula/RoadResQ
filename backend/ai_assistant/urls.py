from django.urls import path

from ai_assistant.views import AnalyzeSymptomsView

urlpatterns = [
    path('analyze/', AnalyzeSymptomsView.as_view(), name='ai-analyze'),
]
