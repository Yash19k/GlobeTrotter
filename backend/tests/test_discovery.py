"""
GlobeTrotter — City and Activity Discovery Unit Tests

Tests for City and Activity list, search, filter, ordering, pagination, and detail endpoints.
"""

from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.destinations.models import City
from apps.activities.models import Activity

User = get_user_model()


class DiscoveryAPITests(APITestCase):
    """Test suite for City and Activity discovery APIs."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="discovery_user@example.com",
            password="Password123!",
            first_name="Discovery",
            last_name="Tester",
        )
        self.client.force_authenticate(user=self.user)

        self.cities_url = reverse("city-list")
        self.activities_url = reverse("activity-list")

        # Create test cities
        self.paris = City.objects.create(
            name="Paris",
            country="France",
            region="Europe",
            description="City of light",
            cost_index=4,
            popularity_score=Decimal("9.6"),
        )
        self.tokyo = City.objects.create(
            name="Tokyo",
            country="Japan",
            region="Asia",
            description="Futuristic metropolis",
            cost_index=4,
            popularity_score=Decimal("9.7"),
        )
        self.rome = City.objects.create(
            name="Rome",
            country="Italy",
            region="Europe",
            description="Eternal city",
            cost_index=3,
            popularity_score=Decimal("9.4"),
        )

        # Create test activities
        self.louvre = Activity.objects.create(
            city=self.paris,
            name="Louvre Museum Tour",
            description="World famous art museum",
            category=Activity.Category.CULTURE,
            duration_minutes=180,
            estimated_cost=Decimal("22.00"),
        )
        self.eiffel = Activity.objects.create(
            city=self.paris,
            name="Eiffel Tower Summit",
            description="Iconic landmark",
            category=Activity.Category.SIGHTSEEING,
            duration_minutes=120,
            estimated_cost=Decimal("35.00"),
        )
        self.ramen = Activity.objects.create(
            city=self.tokyo,
            name="Tokyo Ramen Tasting",
            description="Sample authentic ramen",
            category=Activity.Category.FOOD,
            duration_minutes=90,
            estimated_cost=Decimal("15.00"),
        )

    # ── City Tests ──────────────────────────────────────────────

    def test_unauthenticated_city_list_fails(self):
        """Verify unauthenticated access to cities returns 401."""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.cities_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_cities_paginated(self):
        """Verify authenticated user can list cities with pagination metadata."""
        response = self.client.get(self.cities_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 3)

    def test_city_search(self):
        """Verify case-insensitive search by city name, country, or region."""
        response = self.client.get(self.cities_url, {"search": "paris"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Paris")

        # Search by country
        response_japan = self.client.get(self.cities_url, {"search": "Japan"})
        self.assertEqual(len(response_japan.data["results"]), 1)
        self.assertEqual(response_japan.data["results"][0]["name"], "Tokyo")

    def test_city_country_and_region_filtering(self):
        """Verify filtering by country, region, and cost_index."""
        response = self.client.get(self.cities_url, {"country": "France"})
        self.assertEqual(len(response.data["results"]), 1)

        response_europe = self.client.get(self.cities_url, {"region": "Europe"})
        self.assertEqual(len(response_europe.data["results"]), 2)

        response_cost = self.client.get(self.cities_url, {"cost_index": 3})
        self.assertEqual(len(response_cost.data["results"]), 1)
        self.assertEqual(response_cost.data["results"][0]["name"], "Rome")

    def test_city_ordering(self):
        """Verify whitelisted ordering options for cities."""
        # Order by -popularity_score (default)
        response = self.client.get(self.cities_url, {"ordering": "-popularity_score"})
        self.assertEqual(response.data["results"][0]["name"], "Tokyo")

        # Order by name
        response_name = self.client.get(self.cities_url, {"ordering": "name"})
        self.assertEqual(response_name.data["results"][0]["name"], "Paris")

    def test_city_detail(self):
        """Verify GET /api/v1/cities/{id}/ returns city metadata."""
        url = reverse("city-detail", kwargs={"pk": self.paris.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Paris")
        self.assertEqual(response.data["country"], "France")

    # ── Activity Tests ──────────────────────────────────────────

    def test_list_activities(self):
        """Verify authenticated user can list activities."""
        response = self.client.get(self.activities_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 3)

    def test_activity_search(self):
        """Verify case-insensitive activity search by name/description."""
        response = self.client.get(self.activities_url, {"search": "ramen"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Tokyo Ramen Tasting")

    def test_activity_filtering(self):
        """Verify filtering activities by city, category, cost range, and duration range."""
        # Filter by city
        response_city = self.client.get(self.activities_url, {"city": self.paris.id})
        self.assertEqual(len(response_city.data["results"]), 2)

        # Filter by category
        response_cat = self.client.get(self.activities_url, {"category": "FOOD"})
        self.assertEqual(len(response_cat.data["results"]), 1)
        self.assertEqual(response_cat.data["results"][0]["name"], "Tokyo Ramen Tasting")

        # Filter by cost range
        response_cost = self.client.get(self.activities_url, {"max_cost": "20.00"})
        self.assertEqual(len(response_cost.data["results"]), 1)
        self.assertEqual(response_cost.data["results"][0]["name"], "Tokyo Ramen Tasting")

        # Filter by duration
        response_dur = self.client.get(self.activities_url, {"min_duration": 150})
        self.assertEqual(len(response_dur.data["results"]), 1)
        self.assertEqual(response_dur.data["results"][0]["name"], "Louvre Museum Tour")

    def test_activity_ordering(self):
        """Verify whitelisted ordering options for activities."""
        response = self.client.get(self.activities_url, {"ordering": "estimated_cost"})
        self.assertEqual(response.data["results"][0]["name"], "Tokyo Ramen Tasting")

        response_desc = self.client.get(self.activities_url, {"ordering": "-estimated_cost"})
        self.assertEqual(response_desc.data["results"][0]["name"], "Eiffel Tower Summit")

    def test_activity_detail(self):
        """Verify GET /api/v1/activities/{id}/ returns activity detail with city_name."""
        url = reverse("activity-detail", kwargs={"pk": self.louvre.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Louvre Museum Tour")
        self.assertEqual(response.data["city_name"], "Paris")
