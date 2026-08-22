"""
GlobeTrotter — Activity Views

API views for Activity discovery, filtering, search, and details.
"""

from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.activities.models import Activity
from apps.activities.serializers import ActivitySerializer
from services.discovery_service import get_activities_queryset


class ActivityListView(generics.ListAPIView):
    """
    GET /api/v1/activities/
    Returns a paginated list of activities with search, city/category/cost/duration filtering, and ordering.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        return get_activities_queryset(self.request.query_params)

    @extend_schema(
        summary="List & search activities",
        description="Retrieve a paginated list of city activities with support for search, category/city/cost/duration filtering, and ordering.",
        parameters=[
            OpenApiParameter(name="search", description="Search term for activity name or description", type=str),
            OpenApiParameter(name="city", description="Filter by City ID", type=int),
            OpenApiParameter(name="category", description="Filter by category enum (e.g. SIGHTSEEING, FOOD, ADVENTURE)", type=str),
            OpenApiParameter(name="min_cost", description="Filter by minimum estimated cost", type=float),
            OpenApiParameter(name="max_cost", description="Filter by maximum estimated cost", type=float),
            OpenApiParameter(name="min_duration", description="Filter by minimum duration in minutes", type=int),
            OpenApiParameter(name="max_duration", description="Filter by maximum duration in minutes", type=int),
            OpenApiParameter(
                name="ordering",
                description="Ordering field: name, -name, estimated_cost, -estimated_cost, duration_minutes, -duration_minutes",
                type=str,
            ),
        ],
        responses={200: ActivitySerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ActivityDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/activities/{id}/
    Retrieve detailed metadata for a specific activity.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer
    queryset = Activity.objects.select_related("city").all()

    @extend_schema(
        summary="Get activity detail",
        description="Retrieve full metadata for a specific activity by ID.",
        responses={200: ActivitySerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
