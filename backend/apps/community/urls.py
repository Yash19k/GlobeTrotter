"""
GlobeTrotter — Community & Sharing URL Configuration
"""

from django.urls import path
from .views import (
    PublishTripView,
    UnpublishTripView,
    PublicTripDetailView,
    CopyPublicTripView,
    CommunityFeedView,
)

urlpatterns = [
    # Publish & Unpublish
    path("trips/<int:trip_id>/publish/", PublishTripView.as_view(), name="trip-publish"),
    path("trips/<int:trip_id>/unpublish/", UnpublishTripView.as_view(), name="trip-unpublish"),

    # Read-only Public Itinerary & Copy Trip
    path("public/trips/<slug:slug>/", PublicTripDetailView.as_view(), name="public-trip-detail"),
    path("public/trips/<slug:slug>/copy/", CopyPublicTripView.as_view(), name="public-trip-copy"),

    # Community Discovery Feed
    path("community/trips/", CommunityFeedView.as_view(), name="community-trips"),
]
