"""
GlobeTrotter — Destination Serializers

Serializers for City and SavedCity models.
"""

from rest_framework import serializers
from apps.destinations.models import City, SavedCity


class CitySerializer(serializers.ModelSerializer):
    """Serializer for City model discovery & details."""

    activity_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = City
        fields = (
            "id",
            "name",
            "country",
            "region",
            "description",
            "image",
            "cost_index",
            "popularity_score",
            "activity_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class SavedCitySerializer(serializers.ModelSerializer):
    """Serializer for user saved cities."""

    city = CitySerializer(read_only=True)
    city_id = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), source="city", write_only=True
    )

    class Meta:
        model = SavedCity
        fields = ("id", "user", "city", "city_id", "created_at")
        read_only_fields = ("id", "user", "created_at")
