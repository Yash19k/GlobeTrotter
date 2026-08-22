"""
GlobeTrotter — Community & Sharing Serializers

Public trip serializers and community feed output serializers.
"""

from rest_framework import serializers
from apps.trips.models import Trip


class PublicCreatorSerializer(serializers.Serializer):
    first_name = serializers.CharField()


class PublicActivityDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    category = serializers.CharField()
    duration_minutes = serializers.IntegerField()
    estimated_cost = serializers.CharField()
    image = serializers.CharField(allow_blank=True, required=False)


class PublicTripActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    activity = PublicActivityDetailSerializer()
    activity_date = serializers.CharField()
    start_time = serializers.CharField(allow_blank=True)
    estimated_cost = serializers.CharField()
    notes = serializers.CharField(allow_blank=True)


class PublicCityDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    country = serializers.CharField()
    image = serializers.CharField(allow_blank=True, required=False)


class PublicTripStopSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    city = PublicCityDetailSerializer()
    start_date = serializers.CharField()
    end_date = serializers.CharField()
    stop_order = serializers.IntegerField()
    transport_cost = serializers.CharField()
    accommodation_cost = serializers.CharField()
    activities = PublicTripActivitySerializer(many=True)


class PublicBudgetSummarySerializer(serializers.Serializer):
    currency = serializers.CharField()
    estimated_total = serializers.CharField()
    average_daily_cost = serializers.CharField()
    categories = serializers.DictField()


class PublicTripMetaSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    cover_image = serializers.CharField(allow_blank=True)
    start_date = serializers.CharField()
    end_date = serializers.CharField()
    duration_days = serializers.IntegerField()
    share_slug = serializers.CharField()
    created_at = serializers.CharField()


class PublicTripDetailResponseSerializer(serializers.Serializer):
    """Full read-only public itinerary response."""

    trip = PublicTripMetaSerializer()
    creator = PublicCreatorSerializer()
    stops = PublicTripStopSerializer(many=True)
    budget_summary = PublicBudgetSummarySerializer()


class PublishStatusResponseSerializer(serializers.Serializer):
    is_public = serializers.BooleanField()
    share_slug = serializers.CharField(required=False)
    public_url = serializers.CharField(required=False)


class CommunityTripCardSerializer(serializers.ModelSerializer):
    """Serializer for community discovery feed cards."""

    creator = serializers.SerializerMethodField()
    cities = serializers.SerializerMethodField()
    duration_days = serializers.SerializerMethodField()
    estimated_cost = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = (
            "id",
            "name",
            "description",
            "cover_image",
            "start_date",
            "end_date",
            "duration_days",
            "share_slug",
            "creator",
            "cities",
            "estimated_cost",
            "created_at",
        )

    def get_creator(self, obj) -> str:
        return obj.user.first_name or "Explorer"

    def get_cities(self, obj):
        stops = obj.stops.all()
        return [
            {"id": s.city.id, "name": s.city.name, "country": s.city.country}
            for s in stops
        ]

    def get_duration_days(self, obj) -> int:
        return max((obj.end_date - obj.start_date).days + 1, 1)

    def get_estimated_cost(self, obj) -> str:
        # Sum stop transport, accommodation, and activities
        total = sum((s.transport_cost or 0) + (s.accommodation_cost or 0) for s in obj.stops.all())
        for s in obj.stops.all():
            total += sum(a.estimated_cost or 0 for a in s.trip_activities.all())
        return str(total)
