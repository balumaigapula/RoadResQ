from rest_framework import serializers

from services.models import ProblemType, ServiceCategory


class ServiceCategorySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()


class ProblemTypeSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
