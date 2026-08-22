"""
GlobeTrotter — Itinerary Service Layer

Encapsulates all business logic, date validation, city matching, and order normalization
for TripStops and TripActivities.
"""

from datetime import datetime, date
from typing import List, Dict, Any
from django.db import transaction
from django.db.models import Max, Prefetch
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, PermissionDenied

from apps.trips.models import Trip
from apps.destinations.models import City
from apps.activities.models import Activity
from apps.itinerary.models import TripStop, TripActivity


def _parse_date(val: Any) -> date:
    """Helper to parse a date string or return a date object."""
    if isinstance(val, str):
        try:
            return datetime.strptime(val, "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError({"date": f"Invalid date format '{val}'. Expected YYYY-MM-DD."})
    return val


def get_user_trip(user, trip_id: int) -> Trip:
    """Helper to retrieve a trip and ensure user ownership."""
    return get_object_or_404(Trip.objects.filter(user=user), pk=trip_id)


def get_user_stop(user, stop_id: int) -> TripStop:
    """Helper to retrieve a stop and ensure parent trip user ownership."""
    stop = get_object_or_404(TripStop.objects.select_related("trip", "city"), pk=stop_id)
    if stop.trip.user != user:
        raise PermissionDenied("You do not have permission to access this trip stop.")
    return stop


def get_user_trip_activity(user, trip_activity_id: int) -> TripActivity:
    """Helper to retrieve a scheduled trip activity and ensure parent trip ownership."""
    trip_activity = get_object_or_404(
        TripActivity.objects.select_related("trip_stop", "trip_stop__trip", "activity"),
        pk=trip_activity_id,
    )
    if trip_activity.trip_stop.trip.user != user:
        raise PermissionDenied("You do not have permission to access this scheduled activity.")
    return trip_activity


def get_trip_itinerary(user, trip_id: int) -> Dict[str, Any]:
    """
    Retrieves full itinerary for a trip avoiding N+1 queries.
    Uses select_related and prefetch_related for high performance.
    """
    trip = get_user_trip(user, trip_id)

    activity_prefetch = Prefetch(
        "trip_activities",
        queryset=TripActivity.objects.select_related("activity").order_by(
            "activity_date", "start_time", "activity_order"
        ),
    )

    stops = (
        TripStop.objects.filter(trip=trip)
        .select_related("city")
        .prefetch_related(activity_prefetch)
        .order_by("stop_order")
    )

    return {
        "trip": trip,
        "stops": stops,
    }


def create_trip_stop(user, trip_id: int, data: Dict[str, Any]) -> TripStop:
    """
    Creates a new TripStop in a trip with strict date validation and auto-ordering.
    """
    trip = get_user_trip(user, trip_id)

    city_id = data.get("city")
    if not city_id:
        raise ValidationError({"city": "City is required."})
    city = get_object_or_404(City, pk=city_id)

    raw_start = data.get("start_date")
    raw_end = data.get("end_date")

    if not raw_start or not raw_end:
        raise ValidationError({"dates": "Both start_date and end_date are required."})

    start_date = _parse_date(raw_start)
    end_date = _parse_date(raw_end)

    # Rule 1: stop dates within trip dates
    if start_date < trip.start_date:
        raise ValidationError({"start_date": f"Stop start date ({start_date}) cannot be before trip start date ({trip.start_date})."})
    if end_date > trip.end_date:
        raise ValidationError({"end_date": f"Stop end date ({end_date}) cannot be after trip end date ({trip.end_date})."})
    if end_date < start_date:
        raise ValidationError({"end_date": "Stop end date cannot be before start date."})

    # Rule 2: check overlapping stops for this trip
    overlapping = TripStop.objects.filter(
        trip=trip,
        start_date__lt=end_date,
        end_date__gt=start_date,
    ).exists()

    if overlapping:
        raise ValidationError({"dates": "This stop's date range overlaps with an existing stop in your trip."})

    # Rule 3: auto-assign stop_order
    max_order = TripStop.objects.filter(trip=trip).aggregate(Max("stop_order"))["stop_order__max"] or 0
    next_order = max_order + 1

    stop = TripStop.objects.create(
        trip=trip,
        city=city,
        start_date=start_date,
        end_date=end_date,
        stop_order=next_order,
        transport_cost=data.get("transport_cost", 0),
        accommodation_cost=data.get("accommodation_cost", 0),
        notes=data.get("notes", ""),
    )
    return stop


def update_trip_stop(user, stop_id: int, data: Dict[str, Any]) -> TripStop:
    """
    Updates an existing TripStop with date and overlap validation.
    """
    stop = get_user_stop(user, stop_id)
    trip = stop.trip

    start_date = _parse_date(data.get("start_date", stop.start_date))
    end_date = _parse_date(data.get("end_date", stop.end_date))

    if start_date < trip.start_date:
        raise ValidationError({"start_date": f"Stop start date ({start_date}) cannot be before trip start date ({trip.start_date})."})
    if end_date > trip.end_date:
        raise ValidationError({"end_date": f"Stop end date ({end_date}) cannot be after trip end date ({trip.end_date})."})
    if end_date < start_date:
        raise ValidationError({"end_date": "Stop end date cannot be before start date."})

    # Check overlap with OTHER stops
    overlapping = TripStop.objects.filter(
        trip=trip,
        start_date__lt=end_date,
        end_date__gt=start_date,
    ).exclude(pk=stop_id).exists()

    if overlapping:
        raise ValidationError({"dates": "Updated stop dates overlap with another existing stop."})

    if "city" in data:
        city_id = data["city"]
        stop.city = get_object_or_404(City, pk=city_id)

    stop.start_date = start_date
    stop.end_date = end_date
    if "transport_cost" in data:
        stop.transport_cost = data["transport_cost"]
    if "accommodation_cost" in data:
        stop.accommodation_cost = data["accommodation_cost"]
    if "notes" in data:
        stop.notes = data["notes"]

    stop.save()

    # Re-validate existing scheduled activities to fit within updated stop dates
    invalid_activities = stop.trip_activities.filter(
        activity_date__lt=start_date
    ) | stop.trip_activities.filter(activity_date__gt=end_date)

    if invalid_activities.exists():
        raise ValidationError({
            "dates": "Updating stop dates would leave scheduled activities outside the stop range. Adjust activity dates first."
        })

    return stop


def delete_trip_stop(user, stop_id: int) -> None:
    """
    Deletes a TripStop and renormalizes stop_order for remaining stops.
    """
    stop = get_user_stop(user, stop_id)
    trip = stop.trip

    with transaction.atomic():
        stop.delete()
        _normalize_stop_orders(trip)


def reorder_trip_stops(user, trip_id: int, stop_ids: List[int]) -> List[TripStop]:
    """
    Reorders stops for a trip safely avoiding database constraint collisions.
    """
    trip = get_user_trip(user, trip_id)

    existing_stops = list(TripStop.objects.filter(trip=trip))
    existing_ids = {s.id for s in existing_stops}

    if set(stop_ids) != existing_ids:
        raise ValidationError({"stop_ids": "Invalid stop IDs provided for reordering."})

    with transaction.atomic():
        # Step 1: Temporarily set stop_order to large offset to avoid uq_stop_trip_order conflict & non-negative constraint
        for idx, s_id in enumerate(stop_ids, start=1):
            TripStop.objects.filter(pk=s_id).update(stop_order=10000 + idx)

        # Step 2: Set final positive stop_order values
        for idx, s_id in enumerate(stop_ids, start=1):
            TripStop.objects.filter(pk=s_id).update(stop_order=idx)

    return list(TripStop.objects.filter(trip=trip).select_related("city").order_by("stop_order"))


def _normalize_stop_orders(trip: Trip) -> None:
    """Internal helper to ensure sequential 1, 2, 3 stop orders."""
    stops = TripStop.objects.filter(trip=trip).order_by("stop_order", "id")
    for idx, stop in enumerate(stops, start=1):
        if stop.stop_order != idx:
            stop.stop_order = idx
            stop.save(update_fields=["stop_order"])


def add_trip_activity(user, stop_id: int, data: Dict[str, Any]) -> TripActivity:
    """
    Schedules an activity into a stop with city matching and date range validation.
    """
    stop = get_user_stop(user, stop_id)

    activity_id = data.get("activity")
    if not activity_id:
        raise ValidationError({"activity": "Activity ID is required."})

    activity = get_object_or_404(Activity, pk=activity_id)

    # City Matching Validation
    if activity.city_id != stop.city_id:
        raise ValidationError({
            "activity": f"Activity '{activity.name}' belongs to {activity.city.name}, but this stop is for {stop.city.name}."
        })

    raw_date = data.get("activity_date")
    if not raw_date:
        raise ValidationError({"activity_date": "activity_date is required."})

    activity_date = _parse_date(raw_date)

    # Date Range Validation
    if activity_date < stop.start_date or activity_date > stop.end_date:
        raise ValidationError({
            "activity_date": f"Activity date ({activity_date}) must fall between stop dates ({stop.start_date} → {stop.end_date})."
        })

    # Duplicate activity on same date validation
    existing_duplicate = TripActivity.objects.filter(
        trip_stop=stop,
        activity=activity,
        activity_date=activity_date,
    ).exists()

    if existing_duplicate:
        raise ValidationError({
            "activity": f"'{activity.name}' is already scheduled on {activity_date} for this stop."
        })

    # Copy estimated cost from master Activity if not provided
    cost = data.get("estimated_cost")
    if cost is None or cost == "":
        cost = activity.estimated_cost

    max_order = TripActivity.objects.filter(
        trip_stop=stop,
        activity_date=activity_date
    ).aggregate(Max("activity_order"))["activity_order__max"] or 0

    trip_activity = TripActivity.objects.create(
        trip_stop=stop,
        activity=activity,
        activity_date=activity_date,
        start_time=data.get("start_time"),
        notes=data.get("notes", ""),
        estimated_cost=cost,
        activity_order=max_order + 1,
    )
    return trip_activity


def update_trip_activity(user, trip_activity_id: int, data: Dict[str, Any]) -> TripActivity:
    """
    Updates a scheduled activity (date, time, notes, cost).
    """
    trip_activity = get_user_trip_activity(user, trip_activity_id)
    stop = trip_activity.trip_stop

    if "activity_date" in data:
        new_date = _parse_date(data["activity_date"])
        if new_date < stop.start_date or new_date > stop.end_date:
            raise ValidationError({
                "activity_date": f"Activity date ({new_date}) must fall between stop dates ({stop.start_date} → {stop.end_date})."
            })
        trip_activity.activity_date = new_date

    if "start_time" in data:
        trip_activity.start_time = data["start_time"]

    if "notes" in data:
        trip_activity.notes = data["notes"]

    if "estimated_cost" in data:
        trip_activity.estimated_cost = data["estimated_cost"]

    trip_activity.save()
    return trip_activity


def delete_trip_activity(user, trip_activity_id: int) -> None:
    """
    Deletes a scheduled activity and normalizes ordering.
    """
    trip_activity = get_user_trip_activity(user, trip_activity_id)
    stop = trip_activity.trip_stop
    date = trip_activity.activity_date

    with transaction.atomic():
        trip_activity.delete()
        _normalize_activity_orders(stop, date)


def reorder_trip_activities(user, stop_id: int, activity_ids: List[int]) -> List[TripActivity]:
    """
    Reorders scheduled activities within a stop.
    """
    stop = get_user_stop(user, stop_id)

    existing_acts = list(TripActivity.objects.filter(trip_stop=stop))
    existing_ids = {a.id for a in existing_acts}

    if set(activity_ids) != existing_ids:
        raise ValidationError({"activity_ids": "Invalid activity IDs provided for reordering."})

    with transaction.atomic():
        for idx, a_id in enumerate(activity_ids, start=1):
            TripActivity.objects.filter(pk=a_id).update(activity_order=idx)

    return list(TripActivity.objects.filter(trip_stop=stop).select_related("activity").order_by("activity_date", "activity_order"))


def _normalize_activity_orders(stop: TripStop, date) -> None:
    """Internal helper to ensure sequential activity orders for a stop date."""
    acts = TripActivity.objects.filter(trip_stop=stop, activity_date=date).order_by("activity_order", "id")
    for idx, act in enumerate(acts, start=1):
        if act.activity_order != idx:
            act.activity_order = idx
            act.save(update_fields=["activity_order"])
