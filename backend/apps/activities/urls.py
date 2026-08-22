"""
GlobeTrotter — Activities URL Configuration

Endpoints mounted under /api/v1/activities/
"""

from django.urls import path
from .views import ActivityListView, ActivityDetailView

urlpatterns = [
    path("", ActivityListView.as_view(), name="activity-list"),
    path("<int:pk>/", ActivityDetailView.as_view(), name="activity-detail"),
]
