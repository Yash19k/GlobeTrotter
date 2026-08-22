"""
GlobeTrotter — Activity Serializers

Serializers for Activity model discovery & details.
"""

from rest_framework import serializers
from apps.activities.models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity model with read-only city_name attribute."""

    city_name = serializers.CharField(source="city.name", read_only=True)
    city_country = serializers.CharField(source="city.country", read_only=True)

    class Meta:
        model = Activity
        fields = (
            "id",
            "city",
            "city_name",
            "city_country",
            "name",
            "description",
            "category",
            "duration_minutes",
            "estimated_cost",
            "image",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "city_name", "city_country", "created_at", "updated_at")
