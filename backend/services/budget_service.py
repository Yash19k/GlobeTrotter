"""
GlobeTrotter — Budget Service Layer

Encapsulates all trip budget calculations, category totals, city stop breakdowns,
daily cost breakdowns, and budget status logic.
"""

from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import Dict, Any, List
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch

from apps.trips.models import Trip
from apps.itinerary.models import TripStop, TripActivity
from apps.budget.models import Expense


def get_user_trip(user, trip_id: int) -> Trip:
    """Helper to retrieve a trip and verify user ownership."""
    return get_object_or_404(Trip.objects.filter(user=user), pk=trip_id)


def calculate_trip_budget(user, trip_id: int) -> Dict[str, Any]:
    """
    Calculates comprehensive budget metrics for a trip in 1 efficient query pass.
    Avoids N+1 queries using select_related and prefetch_related.
    """
    trip = get_user_trip(user, trip_id)

    activity_prefetch = Prefetch(
        "trip_activities",
        queryset=TripActivity.objects.select_related("activity"),
    )

    stops = (
        TripStop.objects.filter(trip=trip)
        .select_related("city")
        .prefetch_related(activity_prefetch)
        .order_by("stop_order")
    )

    expenses = Expense.objects.filter(trip=trip).order_by("expense_date")

    # Category accumulator totals
    cat_transport = Decimal("0.00")
    cat_accommodation = Decimal("0.00")
    cat_activities = Decimal("0.00")
    cat_meals = Decimal("0.00")
    cat_other = Decimal("0.00")

    stops_breakdown: List[Dict[str, Any]] = []

    # Process TripStops and scheduled activities
    for stop in stops:
        s_transport = Decimal(str(stop.transport_cost or 0))
        s_accommodation = Decimal(str(stop.accommodation_cost or 0))

        cat_transport += s_transport
        cat_accommodation += s_accommodation

        s_activities_cost = Decimal("0.00")

        for trip_act in stop.trip_activities.all():
            act_cost = Decimal(str(trip_act.estimated_cost or 0))
            s_activities_cost += act_cost

            # Map activity category to budget category
            cat_name = (trip_act.activity.category or "").upper()
            if cat_name == "FOOD":
                cat_meals += act_cost
            else:
                cat_activities += act_cost

        stop_total = s_transport + s_accommodation + s_activities_cost

        stops_breakdown.append({
            "id": stop.id,
            "city_id": stop.city.id,
            "city_name": stop.city.name,
            "country": stop.city.country,
            "start_date": stop.start_date.isoformat(),
            "end_date": stop.end_date.isoformat(),
            "transport_cost": str(s_transport),
            "accommodation_cost": str(s_accommodation),
            "activities_cost": str(s_activities_cost),
            "total_cost": str(stop_total),
        })

    # Process explicit Expense records
    for exp in expenses:
        exp_amount = Decimal(str(exp.amount or 0))
        cat = (exp.category or "").upper()

        if cat == "TRANSPORT":
            cat_transport += exp_amount
        elif cat == "ACCOMMODATION":
            cat_accommodation += exp_amount
        elif cat == "ACTIVITY":
            cat_activities += exp_amount
        elif cat == "MEAL":
            cat_meals += exp_amount
        else:
            cat_other += exp_amount

    estimated_total = cat_transport + cat_accommodation + cat_activities + cat_meals + cat_other
    total_budget = Decimal(str(trip.total_budget or 0))
    remaining_budget = total_budget - estimated_total

    # Budget Used Percentage
    if total_budget > Decimal("0.00"):
        budget_used_percentage = float(round((estimated_total / total_budget) * Decimal("100.0"), 2))
    else:
        budget_used_percentage = 100.0 if estimated_total > Decimal("0.00") else 0.0

    # Budget Status
    if total_budget == Decimal("0.00") and estimated_total > Decimal("0.00"):
        status = "OVER_BUDGET"
    elif estimated_total > total_budget:
        status = "OVER_BUDGET"
    elif total_budget > Decimal("0.00") and estimated_total >= (total_budget * Decimal("0.80")):
        status = "NEAR_LIMIT"
    else:
        status = "WITHIN_BUDGET"

    # Duration & Average Daily Cost
    start_dt = trip.start_date
    end_dt = trip.end_date
    duration_days = max((end_dt - start_dt).days + 1, 1)
    average_daily_cost = str(round(estimated_total / Decimal(duration_days), 2))

    # Daily Breakdown
    days_breakdown: List[Dict[str, Any]] = []

    for i in range(duration_days):
        current_date = start_dt + timedelta(days=i)
        current_str = current_date.isoformat()

        d_activities = Decimal("0.00")
        d_expenses = Decimal("0.00")
        d_lodging_transport = Decimal("0.00")

        # Sum activities on this date
        for stop in stops:
            for trip_act in stop.trip_activities.all():
                if trip_act.activity_date == current_date:
                    d_activities += Decimal(str(trip_act.estimated_cost or 0))

        # Sum expenses on this date
        for exp in expenses:
            if exp.expense_date == current_date:
                d_expenses += Decimal(str(exp.amount or 0))

        # Allocate daily lodging/transport for stops active on this date
        for stop in stops:
            if stop.start_date <= current_date <= stop.end_date:
                stop_days = max((stop.end_date - stop.start_date).days + 1, 1)
                daily_lodging_trans = (Decimal(str(stop.transport_cost or 0)) + Decimal(str(stop.accommodation_cost or 0))) / Decimal(stop_days)
                d_lodging_transport += daily_lodging_trans

        daily_total = d_activities + d_expenses + d_lodging_transport

        days_breakdown.append({
            "date": current_str,
            "day_number": i + 1,
            "label": f"Day {i + 1}",
            "activities_cost": str(round(d_activities, 2)),
            "expenses_cost": str(round(d_expenses, 2)),
            "fixed_daily_cost": str(round(d_lodging_transport, 2)),
            "total_cost": str(round(daily_total, 2)),
        })

    return {
        "trip_id": trip.id,
        "trip_name": trip.name,
        "currency": "USD",
        "total_budget": str(total_budget),
        "estimated_total": str(estimated_total),
        "remaining_budget": str(remaining_budget),
        "budget_used_percentage": budget_used_percentage,
        "status": status,
        "duration_days": duration_days,
        "average_daily_cost": average_daily_cost,
        "categories": {
            "transport": str(cat_transport),
            "accommodation": str(cat_accommodation),
            "activities": str(cat_activities),
            "meals": str(cat_meals),
            "other": str(cat_other),
        },
        "stops": stops_breakdown,
        "days": days_breakdown,
    }


def add_expense(user, trip_id: int, data: Dict[str, Any]) -> Expense:
    """Creates a new explicit Expense for a trip."""
    trip = get_user_trip(user, trip_id)

    expense_date = data.get("expense_date", trip.start_date)
    category = data.get("category", Expense.Category.OTHER)
    amount = Decimal(str(data.get("amount", 0)))
    description = data.get("description", "")

    return Expense.objects.create(
        trip=trip,
        category=category,
        amount=amount,
        description=description,
        expense_date=expense_date,
    )


def delete_expense(user, expense_id: int) -> None:
    """Deletes an explicit Expense."""
    expense = get_object_or_404(Expense.objects.select_related("trip"), pk=expense_id)
    if expense.trip.user != user:
        raise PermissionDenied("You do not have permission to delete this expense.")
    expense.delete()
