"""
GlobeTrotter — Root URL Configuration

API routes are versioned under /api/v1/.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from apps.users.analytics_views import AnalyticsSummaryView

def health_check(request):
    return JsonResponse({"status": "healthy"})

urlpatterns = [
    # Health check
    path("health/", health_check, name="health-check"),

    # Django admin
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/trips/", include("apps.trips.urls")),
    path("api/v1/cities/", include("apps.destinations.urls")),
    path("api/v1/activities/", include("apps.activities.urls")),
    path("api/v1/", include("apps.itinerary.urls")),
    path("api/v1/", include("apps.budget.urls")),
    path("api/v1/", include("apps.community.urls")),
    path("api/v1/analytics/summary/", AnalyticsSummaryView.as_view(), name="analytics-summary"),

    # API schema & docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
