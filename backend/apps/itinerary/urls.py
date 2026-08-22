"""
GlobeTrotter — Itinerary URL Configuration
"""

from django.urls import path
from .views import (
    TripItineraryView,
    TripStopCreateView,
    TripStopDetailView,
    TripStopReorderView,
    TripActivityCreateView,
    TripActivityDetailView,
    TripActivityReorderView,
)

urlpatterns = [
    # Full Itinerary
    path("trips/<int:trip_id>/itinerary/", TripItineraryView.as_view(), name="trip-itinerary"),

    # Trip Stops
    path("trips/<int:trip_id>/stops/", TripStopCreateView.as_view(), name="trip-stop-create"),
    path("stops/reorder/", TripStopReorderView.as_view(), name="trip-stop-reorder"),
    path("stops/<int:stop_id>/", TripStopDetailView.as_view(), name="trip-stop-detail"),

    # Trip Activities
    path("stops/<int:stop_id>/activities/", TripActivityCreateView.as_view(), name="trip-activity-create"),
    path("trip-activities/reorder/", TripActivityReorderView.as_view(), name="trip-activity-reorder"),
    path("trip-activities/<int:pk>/", TripActivityDetailView.as_view(), name="trip-activity-detail"),
]
