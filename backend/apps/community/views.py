"""
GlobeTrotter — Community & Sharing Views

API Views for publishing/unpublishing trips, public read-only itinerary viewing,
copying trips into user accounts, and community discovery feed.
"""

from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.trips.serializers import TripSerializer
from apps.community.serializers import (
    PublicTripDetailResponseSerializer,
    PublishStatusResponseSerializer,
    CommunityTripCardSerializer,
)
from services import sharing_service


class CommunityPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


class PublishTripView(APIView):
    """
    POST /api/v1/trips/{trip_id}/publish/
    Publish a trip and generate a public share slug.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Publish trip for public sharing",
        responses={200: PublishStatusResponseSerializer},
    )
    def post(self, request, trip_id: int):
        res = sharing_service.publish_trip(request.user, trip_id)
        return Response(res, status=status.HTTP_200_OK)


class UnpublishTripView(APIView):
    """
    POST /api/v1/trips/{trip_id}/unpublish/
    Unpublish a trip to make it private again.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Unpublish trip",
        responses={200: PublishStatusResponseSerializer},
    )
    def post(self, request, trip_id: int):
        res = sharing_service.unpublish_trip(request.user, trip_id)
        return Response(res, status=status.HTTP_200_OK)


class PublicTripDetailView(APIView):
    """
    GET /api/v1/public/trips/{slug}/
    Read-only public itinerary endpoint. Accessible without authentication.
    Returns 404 if trip is not public or does not exist.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get public read-only itinerary",
        responses={200: PublicTripDetailResponseSerializer},
    )
    def get(self, request, slug: str):
        public_data = sharing_service.get_public_trip(slug)
        serializer = PublicTripDetailResponseSerializer(public_data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CopyPublicTripView(APIView):
    """
    POST /api/v1/public/trips/{slug}/copy/
    Deep-copy a public trip into the authenticated user's account as a new private trip.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Copy public trip to account",
        responses={201: TripSerializer},
    )
    def post(self, request, slug: str):
        new_trip = sharing_service.copy_public_trip(request.user, slug)
        serializer = TripSerializer(new_trip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommunityFeedView(ListAPIView):
    """
    GET /api/v1/community/trips/
    List published public trips for community discovery feed.
    """

    permission_classes = [AllowAny]
    serializer_class = CommunityTripCardSerializer
    pagination_class = CommunityPagination

    def get_queryset(self):
        search = self.request.query_params.get("search", "")
        return sharing_service.get_community_trips(search=search)

    @extend_schema(
        summary="List public trips in community feed",
        parameters=[
            OpenApiParameter("search", str, description="Search by title, description, or destination city/country"),
            OpenApiParameter("page", int, description="Page number"),
        ],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
