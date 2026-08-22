"""
GlobeTrotter — Itinerary Serializers

Serializers for TripStop, TripActivity, full itinerary output, and reorder payloads.
"""

from rest_framework import serializers
from apps.itinerary.models import TripStop, TripActivity
from apps.destinations.serializers import CitySerializer
from apps.activities.serializers import ActivitySerializer
from apps.trips.serializers import TripSerializer


class TripActivitySerializer(serializers.ModelSerializer):
    """Serializer for a scheduled activity within a trip stop."""

    activity = ActivitySerializer(read_only=True)
    activity_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TripActivity
        fields = (
            "id",
            "trip_stop",
            "activity",
            "activity_id",
            "activity_date",
            "start_time",
            "notes",
            "estimated_cost",
            "activity_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "trip_stop", "activity_order", "created_at", "updated_at")


class TripStopSerializer(serializers.ModelSerializer):
    """Serializer for a city stop within a trip, including nested activities."""

    city = CitySerializer(read_only=True)
    city_id = serializers.IntegerField(write_only=True)
    activities = TripActivitySerializer(source="trip_activities", many=True, read_only=True)

    class Meta:
        model = TripStop
        fields = (
            "id",
            "trip",
            "city",
            "city_id",
            "start_date",
            "end_date",
            "stop_order",
            "transport_cost",
            "accommodation_cost",
            "notes",
            "activities",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "trip", "stop_order", "activities", "created_at", "updated_at")


class FullItinerarySerializer(serializers.Serializer):
    """Output serializer for GET /api/v1/trips/{trip_id}/itinerary/"""

    trip = TripSerializer()
    stops = TripStopSerializer(many=True)


class StopReorderSerializer(serializers.Serializer):
    """Payload serializer for PATCH /api/v1/stops/reorder/"""

    trip_id = serializers.IntegerField()
    stop_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="Ordered list of stop IDs representing the new sequence.",
    )


class ActivityReorderSerializer(serializers.Serializer):
    """Payload serializer for PATCH /api/v1/trip-activities/reorder/"""

    stop_id = serializers.IntegerField()
    activity_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="Ordered list of TripActivity IDs representing the new sequence.",
    )
