"""
GlobeTrotter — Itinerary API Views

Views delegating to itinerary_service for full itinerary retrieval, stop management,
activity scheduling, and reordering.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.itinerary.serializers import (
    FullItinerarySerializer,
    TripStopSerializer,
    TripActivitySerializer,
    StopReorderSerializer,
    ActivityReorderSerializer,
)
from services import itinerary_service


class TripItineraryView(APIView):
    """
    GET /api/v1/trips/{trip_id}/itinerary/
    Retrieve complete itinerary for a trip (trip metadata + ordered stops + scheduled activities).
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get full trip itinerary",
        description="Retrieve complete itinerary for a user trip with all stops and day-wise scheduled activities.",
        responses={200: FullItinerarySerializer},
    )
    def get(self, request, trip_id: int):
        itinerary_data = itinerary_service.get_trip_itinerary(request.user, trip_id)
        serializer = FullItinerarySerializer(itinerary_data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TripStopCreateView(APIView):
    """
    POST /api/v1/trips/{trip_id}/stops/
    Add a new city stop to a trip.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Add city stop to trip",
        description="Add a new city stop to an existing trip with start/end dates, costs, and notes.",
        responses={201: TripStopSerializer},
    )
    def post(self, request, trip_id: int):
        data = request.data.copy()
        if "city_id" in data and "city" not in data:
            data["city"] = data["city_id"]

        stop = itinerary_service.create_trip_stop(request.user, trip_id, data)
        serializer = TripStopSerializer(stop)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TripStopDetailView(APIView):
    """
    PATCH /api/v1/stops/{stop_id}/
    DELETE /api/v1/stops/{stop_id}/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Update city stop",
        description="Update dates, costs, or notes for a city stop.",
        responses={200: TripStopSerializer},
    )
    def patch(self, request, stop_id: int):
        data = request.data.copy()
        if "city_id" in data and "city" not in data:
            data["city"] = data["city_id"]

        stop = itinerary_service.update_trip_stop(request.user, stop_id, data)
        serializer = TripStopSerializer(stop)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Delete city stop",
        description="Delete a city stop and remove all associated scheduled activities.",
        responses={204: None},
    )
    def delete(self, request, stop_id: int):
        itinerary_service.delete_trip_stop(request.user, stop_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TripStopReorderView(APIView):
    """
    PATCH /api/v1/stops/reorder/
    Reorder stops within a trip.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Reorder trip stops",
        request=StopReorderSerializer,
        responses={200: TripStopSerializer(many=True)},
    )
    def patch(self, request):
        serializer = StopReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        trip_id = serializer.validated_data["trip_id"]
        stop_ids = serializer.validated_data["stop_ids"]

        reordered_stops = itinerary_service.reorder_trip_stops(request.user, trip_id, stop_ids)
        out_serializer = TripStopSerializer(reordered_stops, many=True)
        return Response(out_serializer.data, status=status.HTTP_200_OK)


class TripActivityCreateView(APIView):
    """
    POST /api/v1/stops/{stop_id}/activities/
    Schedule an activity into a city stop.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Schedule activity in stop",
        description="Schedule a catalog activity into a city stop with date, time, and cost.",
        responses={201: TripActivitySerializer},
    )
    def post(self, request, stop_id: int):
        data = request.data.copy()
        if "activity_id" in data and "activity" not in data:
            data["activity"] = data["activity_id"]

        trip_activity = itinerary_service.add_trip_activity(request.user, stop_id, data)
        serializer = TripActivitySerializer(trip_activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TripActivityDetailView(APIView):
    """
    PATCH /api/v1/trip-activities/{id}/
    DELETE /api/v1/trip-activities/{id}/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Update scheduled activity",
        description="Update activity date, time, cost, or notes.",
        responses={200: TripActivitySerializer},
    )
    def patch(self, request, pk: int):
        trip_activity = itinerary_service.update_trip_activity(request.user, pk, request.data)
        serializer = TripActivitySerializer(trip_activity)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Remove scheduled activity",
        description="Remove a scheduled activity from a trip stop.",
        responses={204: None},
    )
    def delete(self, request, pk: int):
        itinerary_service.delete_trip_activity(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TripActivityReorderView(APIView):
    """
    PATCH /api/v1/trip-activities/reorder/
    Reorder activities within a stop.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Reorder scheduled activities",
        request=ActivityReorderSerializer,
        responses={200: TripActivitySerializer(many=True)},
    )
    def patch(self, request):
        serializer = ActivityReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        stop_id = serializer.validated_data["stop_id"]
        activity_ids = serializer.validated_data["activity_ids"]

        reordered = itinerary_service.reorder_trip_activities(request.user, stop_id, activity_ids)
        out_serializer = TripActivitySerializer(reordered, many=True)
        return Response(out_serializer.data, status=status.HTTP_200_OK)
