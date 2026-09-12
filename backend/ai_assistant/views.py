from rest_framework.views import APIView

from ai_assistant.diagnosis import diagnose
from common.response import error, success


class AnalyzeSymptomsView(APIView):
    def post(self, request):
        description = (request.data.get('description') or '').strip()
        if not description:
            return error('Please describe the problem.', status=400)
        return success(data=diagnose(description))
