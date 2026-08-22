"""
GlobeTrotter — Destinations URL Configuration

Endpoints mounted under /api/v1/cities/
"""

from django.urls import path
from .views import CityListView, CityDetailView

urlpatterns = [
    path("", CityListView.as_view(), name="city-list"),
    path("<int:pk>/", CityDetailView.as_view(), name="city-detail"),
]
