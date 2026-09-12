from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.response import success
from services.models import ProblemType, ServiceCategory


class ServiceCategoryListView(APIView):
    """Public, read-only reference data — mirrors SERVICES in the frontend."""
    permission_classes = [AllowAny]

    def get(self, request):
        data = [{'id': choice.value, 'name': choice.label} for choice in ServiceCategory]
        return success(data=data)


class ProblemTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        data = [{'id': choice.value, 'name': choice.label} for choice in ProblemType]
        return success(data=data)
