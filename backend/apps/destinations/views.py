"""
GlobeTrotter — Destination Views

API views for City discovery, filtering, search, and details.
"""

from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.destinations.models import City
from apps.destinations.serializers import CitySerializer
from services.discovery_service import get_cities_queryset


class CityListView(generics.ListAPIView):
    """
    GET /api/v1/cities/
    Returns a paginated list of destination cities with search, filter, and ordering support.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = CitySerializer

    def get_queryset(self):
        return get_cities_queryset(self.request.query_params)

    @extend_schema(
        summary="List & search cities",
        description="Retrieve a paginated list of destination cities with support for search, country/region/cost filtering, and popularity ordering.",
        parameters=[
            OpenApiParameter(name="search", description="Search term for city name, country, or region", type=str),
            OpenApiParameter(name="country", description="Filter by exact country name", type=str),
            OpenApiParameter(name="region", description="Filter by exact region name", type=str),
            OpenApiParameter(name="cost_index", description="Filter by cost index (1-5)", type=int),
            OpenApiParameter(
                name="ordering",
                description="Ordering field: -popularity_score, popularity_score, name, -name, cost_index, -cost_index",
                type=str,
            ),
        ],
        responses={200: CitySerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CityDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/cities/{id}/
    Retrieve detailed metadata for a specific destination city.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = CitySerializer
    queryset = City.objects.all()

    @extend_schema(
        summary="Get city detail",
        description="Retrieve full metadata for a specific city by ID.",
        responses={200: CitySerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
