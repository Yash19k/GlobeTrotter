"""
GlobeTrotter — Analytics & Admin Tests

Unit and integration tests for the analytics summary endpoint.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.destinations.models import City
from apps.activities.models import Activity
from apps.trips.models import Trip
from apps.itinerary.models import TripStop, TripActivity

User = get_user_model()


class AnalyticsSummaryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="admin@globetrotter.test",
            password="SecurePassword123!",
            first_name="Admin",
            last_name="User",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)

        self.city = City.objects.create(
            name="Paris",
            country="France",
            region="Europe",
            cost_index=4,
            popularity_score=9.5,
        )
        self.activity = Activity.objects.create(
            city=self.city,
            name="Eiffel Tower Tour",
            category="SIGHTSEEING",
            duration_minutes=120,
            estimated_cost=45.0,
        )
        self.trip = Trip.objects.create(
            user=self.user,
            name="Euro Trip",
            start_date="2026-06-01",
            end_date="2026-06-10",
            total_budget=2500.0,
            is_public=True,
        )
        self.stop = TripStop.objects.create(
            trip=self.trip,
            city=self.city,
            start_date="2026-06-01",
            end_date="2026-06-05",
            stop_order=1,
            transport_cost=150.0,
            accommodation_cost=400.0,
        )
        self.trip_activity = TripActivity.objects.create(
            trip_stop=self.stop,
            activity=self.activity,
            activity_date="2026-06-02",
            estimated_cost=45.0,
        )

        self.url = reverse("analytics-summary")

    def test_analytics_summary_success(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        self.assertIn("overview", data)
        self.assertIn("popular_cities", data)
        self.assertIn("popular_activities", data)
        self.assertIn("category_distribution", data)
        self.assertIn("trends", data)
        self.assertIn("users", data)

        self.assertEqual(data["overview"]["total_users"], 1)
        self.assertEqual(data["overview"]["total_trips"], 1)
        self.assertEqual(data["overview"]["public_trips"], 1)
        self.assertEqual(len(data["popular_cities"]), 1)
        self.assertEqual(data["popular_cities"][0]["name"], "Paris")
        self.assertEqual(len(data["popular_activities"]), 1)
        self.assertEqual(data["popular_activities"][0]["name"], "Eiffel Tower Tour")

    def test_analytics_summary_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
