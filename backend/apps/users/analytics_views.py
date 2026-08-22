"""
GlobeTrotter — Analytics API Views

Endpoints for aggregate platform metrics, popular items, and user management stats.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from services.analytics_service import get_platform_analytics


class AnalyticsSummaryView(APIView):
    """
    GET /api/v1/analytics/summary/
    Returns aggregate platform overview, popular destinations, popular activities,
    category distribution, user growth trends, and user roster.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get platform analytics and admin summary",
        description="Returns system-wide metrics including user trends, popular cities, popular activities, and user table data.",
    )
    def get(self, request):
        analytics_data = get_platform_analytics()
        return Response(analytics_data, status=status.HTTP_200_OK)
