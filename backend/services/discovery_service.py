"""
GlobeTrotter — Discovery Service Layer

Service functions for searching, filtering, and ordering Cities and Activities.
"""

from typing import Dict, Any
from django.db.models import Q, QuerySet, Count
from apps.destinations.models import City
from apps.activities.models import Activity

ALLOWED_CITY_ORDERINGS = {
    "-popularity_score": "-popularity_score",
    "popularity_score": "popularity_score",
    "name": "name",
    "-name": "-name",
    "cost_index": "cost_index",
    "-cost_index": "-cost_index",
}

ALLOWED_ACTIVITY_ORDERINGS = {
    "name": "name",
    "-name": "-name",
    "estimated_cost": "estimated_cost",
    "-estimated_cost": "-estimated_cost",
    "duration_minutes": "duration_minutes",
    "-duration_minutes": "-duration_minutes",
}


def get_cities_queryset(params: Dict[str, Any]) -> QuerySet[City]:
    """
    Builds filtered and ordered QuerySet for City discovery.
    Supports search (name, country, region), country, region, cost_index, and whitelisted ordering.
    """
    queryset = City.objects.annotate(activity_count=Count("activities"))

    search = params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(country__icontains=search)
            | Q(region__icontains=search)
        )

    country = params.get("country", "").strip()
    if country:
        queryset = queryset.filter(country__iexact=country)

    region = params.get("region", "").strip()
    if region:
        queryset = queryset.filter(region__iexact=region)

    cost_index = params.get("cost_index")
    if cost_index:
        try:
            queryset = queryset.filter(cost_index=int(cost_index))
        except (ValueError, TypeError):
            pass

    ordering_param = params.get("ordering", "-popularity_score")
    ordering = ALLOWED_CITY_ORDERINGS.get(ordering_param, "-popularity_score")
    queryset = queryset.order_by(ordering, "id")

    return queryset


def get_activities_queryset(params: Dict[str, Any]) -> QuerySet[Activity]:
    """
    Builds filtered and ordered QuerySet for Activity discovery.
    Supports search (name, description), city, category, min/max cost, min/max duration, and whitelisted ordering.
    """
    queryset = Activity.objects.select_related("city").all()

    search = params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )

    city_id = params.get("city")
    if city_id:
        try:
            queryset = queryset.filter(city_id=int(city_id))
        except (ValueError, TypeError):
            pass

    category = params.get("category", "").strip()
    if category:
        queryset = queryset.filter(category__iexact=category)

    min_cost = params.get("min_cost")
    if min_cost is not None and min_cost != "":
        try:
            queryset = queryset.filter(estimated_cost__gte=float(min_cost))
        except (ValueError, TypeError):
            pass

    max_cost = params.get("max_cost")
    if max_cost is not None and max_cost != "":
        try:
            queryset = queryset.filter(estimated_cost__lte=float(max_cost))
        except (ValueError, TypeError):
            pass

    min_duration = params.get("min_duration")
    if min_duration is not None and min_duration != "":
        try:
            queryset = queryset.filter(duration_minutes__gte=int(min_duration))
        except (ValueError, TypeError):
            pass

    max_duration = params.get("max_duration")
    if max_duration is not None and max_duration != "":
        try:
            queryset = queryset.filter(duration_minutes__lte=int(max_duration))
        except (ValueError, TypeError):
            pass

    ordering_param = params.get("ordering", "name")
    ordering = ALLOWED_ACTIVITY_ORDERINGS.get(ordering_param, "name")
    queryset = queryset.order_by(ordering, "id")

    return queryset
