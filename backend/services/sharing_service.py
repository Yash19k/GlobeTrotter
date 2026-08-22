"""
GlobeTrotter — Sharing & Community Service Layer

Handles publishing/unpublishing trips, generating unique share slugs,
retrieving read-only public itineraries, deep-copying public trips into user accounts,
and querying community discovery feeds.
"""

import uuid
from decimal import Decimal
from typing import Dict, Any, Optional
from django.db import transaction
from django.db.models import Q, Prefetch
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.trips.models import Trip, SharedTrip
from apps.itinerary.models import TripStop, TripActivity
from services import budget_service


def _generate_unique_slug(trip: Trip) -> str:
    """Generates a clean, readable, unique URL slug for public sharing."""
    base_slug = slugify(trip.name or "trip")[:60]
    if not base_slug:
        base_slug = "trip"

    slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
    while Trip.objects.filter(share_slug=slug).exclude(id=trip.id).exists():
        slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
    return slug


def publish_trip(user, trip_id: int) -> Dict[str, Any]:
    """Publishes a trip, generating a unique share slug if missing."""
    trip = get_object_or_404(Trip.objects.filter(user=user), pk=trip_id)

    with transaction.atomic():
        if not trip.share_slug:
            trip.share_slug = _generate_unique_slug(trip)
        
        trip.is_public = True
        trip.save()

        # Sync SharedTrip record
        SharedTrip.objects.update_or_create(
            trip=trip,
            defaults={"slug": trip.share_slug},
        )

    return {
        "is_public": True,
        "share_slug": trip.share_slug,
        "public_url": f"/public/trips/{trip.share_slug}",
    }


def unpublish_trip(user, trip_id: int) -> Dict[str, Any]:
    """Unpublishes a trip so it is no longer publicly accessible."""
    trip = get_object_or_404(Trip.objects.filter(user=user), pk=trip_id)

    with transaction.atomic():
        trip.is_public = False
        trip.save()

    return {"is_public": False}


def get_public_trip(slug: str) -> Dict[str, Any]:
    """
    Retrieves read-only public itinerary by share slug.
    Raises Http404 if trip is not found or is_public is False.
    Strictly excludes sensitive user or authentication details.
    """
    activity_prefetch = Prefetch(
        "trip_activities",
        queryset=TripActivity.objects.select_related("activity").order_by(
            "activity_date", "start_time", "activity_order"
        ),
    )

    try:
        trip = (
            Trip.objects.filter(share_slug=slug, is_public=True)
            .select_related("user")
            .prefetch_related(
                Prefetch(
                    "stops",
                    queryset=TripStop.objects.select_related("city").prefetch_related(activity_prefetch).order_by("stop_order"),
                )
            )
            .get()
        )
    except Trip.DoesNotExist:
        raise Http404("Public itinerary not found.")

    # Calculate public budget summary
    budget_data = budget_service.calculate_trip_budget(trip.user, trip.id)

    stops_data = []
    for stop in trip.stops.all():
        activities_data = []
        for act in stop.trip_activities.all():
            activities_data.append({
                "id": act.id,
                "activity": {
                    "id": act.activity.id,
                    "name": act.activity.name,
                    "category": act.activity.category,
                    "duration_minutes": act.activity.duration_minutes,
                    "estimated_cost": str(act.activity.estimated_cost),
                    "image": act.activity.image,
                },
                "activity_date": act.activity_date.isoformat(),
                "start_time": act.start_time or "",
                "estimated_cost": str(act.estimated_cost),
                "notes": act.notes or "",
            })

        stops_data.append({
            "id": stop.id,
            "city": {
                "id": stop.city.id,
                "name": stop.city.name,
                "country": stop.city.country,
                "image": stop.city.image,
            },
            "start_date": stop.start_date.isoformat(),
            "end_date": stop.end_date.isoformat(),
            "stop_order": stop.stop_order,
            "transport_cost": str(stop.transport_cost),
            "accommodation_cost": str(stop.accommodation_cost),
            "activities": activities_data,
        })

    duration_days = max((trip.end_date - trip.start_date).days + 1, 1)

    return {
        "trip": {
            "id": trip.id,
            "name": trip.name,
            "description": trip.description,
            "cover_image": trip.cover_image,
            "start_date": trip.start_date.isoformat(),
            "end_date": trip.end_date.isoformat(),
            "duration_days": duration_days,
            "share_slug": trip.share_slug,
            "created_at": trip.created_at.isoformat(),
        },
        "creator": {
            "first_name": trip.user.first_name or "GlobeTrotter Explorer",
        },
        "stops": stops_data,
        "budget_summary": {
            "currency": "USD",
            "estimated_total": budget_data["estimated_total"],
            "average_daily_cost": budget_data["average_daily_cost"],
            "categories": budget_data["categories"],
        },
    }


def copy_public_trip(user, slug: str) -> Trip:
    """
    Deep-copies a public trip into the requesting user's account as a NEW private trip.
    Preserves stop structure, scheduled activities, and costs without duplicating master catalog items.
    """
    try:
        original_trip = (
            Trip.objects.filter(share_slug=slug, is_public=True)
            .prefetch_related(
                Prefetch(
                    "stops",
                    queryset=TripStop.objects.select_related("city").prefetch_related("trip_activities__activity").order_by("stop_order"),
                )
            )
            .get()
        )
    except Trip.DoesNotExist:
        raise Http404("Public trip not found or is private.")

    # Name styling
    if original_trip.name.startswith("Copy of "):
        new_name = original_trip.name
    else:
        new_name = f"Copy of {original_trip.name}"

    with transaction.atomic():
        new_trip = Trip.objects.create(
            user=user,
            name=new_name,
            description=original_trip.description,
            cover_image=original_trip.cover_image,
            start_date=original_trip.start_date,
            end_date=original_trip.end_date,
            total_budget=original_trip.total_budget,
            is_public=False,  # ALWAYS PRIVATE BY DEFAULT
            share_slug=uuid.uuid4().hex[:12],
        )

        for orig_stop in original_trip.stops.all():
            new_stop = TripStop.objects.create(
                trip=new_trip,
                city=orig_stop.city,  # Reuses master City
                start_date=orig_stop.start_date,
                end_date=orig_stop.end_date,
                stop_order=orig_stop.stop_order,
                transport_cost=orig_stop.transport_cost,
                accommodation_cost=orig_stop.accommodation_cost,
                notes=orig_stop.notes,
            )

            for orig_act in orig_stop.trip_activities.all():
                TripActivity.objects.create(
                    trip_stop=new_stop,
                    activity=orig_act.activity,  # Reuses master Activity
                    activity_date=orig_act.activity_date,
                    start_time=orig_act.start_time,
                    estimated_cost=orig_act.estimated_cost,
                    activity_order=orig_act.activity_order,
                    notes=orig_act.notes,
                )

    return new_trip


def get_community_trips(search: str = "") -> Any:
    """
    Returns QuerySet of public trips for community discovery feed.
    """
    qs = Trip.objects.filter(is_public=True).select_related("user").prefetch_related("stops__city").order_by("-created_at")

    if search.strip():
        s = search.strip()
        qs = qs.filter(
            Q(name__icontains=s) |
            Q(description__icontains=s) |
            Q(stops__city__name__icontains=s) |
            Q(stops__city__country__icontains=s)
        ).distinct()

    return qs
