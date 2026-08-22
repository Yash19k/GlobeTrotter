"""
GlobeTrotter — Trip Service Layer

Encapsulates business logic for trip operations (CRUD, filtering, ownership checks).
"""

from typing import Dict, Any
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from apps.trips.models import Trip


def get_user_trips_queryset(user):
    """
    Returns QuerySet of trips owned by the given user,
    ordered by start_date descending.
    """
    return Trip.objects.filter(user=user).select_related("user").prefetch_related("stops").order_by("-start_date")


def get_trip_for_user(user, trip_id: int) -> Trip:
    """
    Retrieves a trip by ID ensuring it belongs to the authenticated user.
    Raises Http404 if not found or owned by another user.
    """
    return get_object_or_404(Trip.objects.filter(user=user), pk=trip_id)


def create_user_trip(user, validated_data: Dict[str, Any]) -> Trip:
    """
    Creates a new trip instance explicitly owned by the request user.
    """
    validated_data["user"] = user
    trip = Trip.objects.create(**validated_data)
    return trip


def update_user_trip(user, trip: Trip, validated_data: Dict[str, Any]) -> Trip:
    """
    Updates an existing trip owned by user with validated fields.
    """
    if trip.user_id != user.id:
        raise PermissionDenied("You do not have permission to edit this trip.")

    for attr, value in validated_data.items():
        setattr(trip, attr, value)

    trip.save()
    return trip


def delete_user_trip(user, trip: Trip) -> None:
    """
    Deletes a trip owned by the given user.
    """
    if trip.user_id != user.id:
        raise PermissionDenied("You do not have permission to delete this trip.")

    trip.delete()
