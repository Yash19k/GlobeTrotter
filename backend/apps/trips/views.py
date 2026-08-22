"""
GlobeTrotter — Trip API Views

Endpoints for Trip CRUD operations strictly scoped to the authenticated user.
"""

from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.trips.serializers import TripSerializer
from services.trip_service import (
    get_user_trips_queryset,
    get_trip_for_user,
    create_user_trip,
    update_user_trip,
    delete_user_trip,
)


class TripListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/trips/
    POST /api/v1/trips/
    List trips owned by the authenticated user or create a new trip.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = TripSerializer

    def get_queryset(self):
        return get_user_trips_queryset(self.request.user)

    @extend_schema(
        summary="List user trips",
        description="Returns a list of all trips owned by the authenticated user, ordered by start date.",
        responses={200: TripSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create a new trip",
        description="Creates a new trip instance owned by the authenticated user.",
        request=TripSerializer,
        responses={
            201: TripSerializer,
            400: OpenApiResponse(description="Validation error (e.g. invalid dates, negative budget)."),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trip = create_user_trip(request.user, serializer.validated_data)
        output_serializer = self.get_serializer(trip)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/v1/trips/{id}/
    PATCH /api/v1/trips/{id}/
    DELETE /api/v1/trips/{id}/
    Retrieve, update, or delete a specific trip owned by the authenticated user.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = TripSerializer

    def get_object(self):
        trip_id = self.kwargs.get("pk")
        return get_trip_for_user(self.request.user, trip_id)

    @extend_schema(
        summary="Get trip detail",
        description="Returns details for a specific trip owned by the authenticated user.",
        responses={
            200: TripSerializer,
            404: OpenApiResponse(description="Trip not found or owned by another user."),
        },
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update a trip",
        description="Updates fields of a trip owned by the authenticated user.",
        request=TripSerializer,
        responses={
            200: TripSerializer,
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Trip not found or owned by another user."),
        },
    )
    def patch(self, request, *args, **kwargs):
        trip = self.get_object()
        serializer = self.get_serializer(trip, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_trip = update_user_trip(request.user, trip, serializer.validated_data)
        return Response(self.get_serializer(updated_trip).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Delete a trip",
        description="Deletes a trip owned by the authenticated user.",
        responses={
            204: OpenApiResponse(description="Trip successfully deleted."),
            404: OpenApiResponse(description="Trip not found or owned by another user."),
        },
    )
    def delete(self, request, *args, **kwargs):
        trip = self.get_object()
        delete_user_trip(request.user, trip)
        return Response(status=status.HTTP_204_NO_CONTENT)
