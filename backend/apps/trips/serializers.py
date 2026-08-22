"""
GlobeTrotter — Trip Serializers

Serializers for Trip CRUD operations with date validation and status/destination_count calculation.
"""

from rest_framework import serializers
from apps.trips.models import Trip, SharedTrip


class TripSerializer(serializers.ModelSerializer):
    """Serializer for Trip model with read-only calculated status and ownership encapsulation."""

    status = serializers.ReadOnlyField()
    destination_count = serializers.ReadOnlyField()
    share_slug = serializers.ReadOnlyField()
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Trip
        fields = (
            "id",
            "name",
            "description",
            "cover_image",
            "start_date",
            "end_date",
            "total_budget",
            "is_public",
            "share_slug",
            "status",
            "destination_count",
            "user_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "share_slug", "status", "destination_count", "user_email", "created_at", "updated_at")

    def validate_total_budget(self, value):
        if value < 0:
            raise serializers.ValidationError("Total budget cannot be negative.")
        return value

    def validate(self, attrs):
        # Resolve start_date and end_date considering partial updates
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        if self.instance:
            if start_date is None:
                start_date = self.instance.start_date
            if end_date is None:
                end_date = self.instance.end_date

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"end_date": "End date must be on or after start date."}
            )

        return attrs


class SharedTripSerializer(serializers.ModelSerializer):
    """Serializer for SharedTrip model."""

    class Meta:
        model = SharedTrip
        fields = ("id", "trip", "slug", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "created_at", "updated_at")
