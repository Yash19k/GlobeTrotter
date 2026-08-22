"""
GlobeTrotter — Trip API & Authorization Unit Tests

Tests for Trip CRUD operations, date/budget validation, status calculation, and strict ownership isolation.
"""

from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.trips.models import Trip

User = get_user_model()


class TripAPITests(APITestCase):
    """Test suite for Trip API endpoints and authorization rules."""

    def setUp(self):
        self.list_create_url = reverse("trip-list-create")

        # Create two distinct users for isolation tests
        self.user_a = User.objects.create_user(
            email="user_a@example.com",
            password="Password123!",
            first_name="User",
            last_name="A",
        )
        self.user_b = User.objects.create_user(
            email="user_b@example.com",
            password="Password123!",
            first_name="User",
            last_name="B",
        )

        today = date.today()
        self.today = today

        # Create trips for User A
        self.trip_a1 = Trip.objects.create(
            user=self.user_a,
            name="Paris Summer Escape",
            description="Exploring the lights",
            start_date=today + timedelta(days=10),
            end_date=today + timedelta(days=20),
            total_budget=Decimal("2500.00"),
        )
        self.trip_a2_completed = Trip.objects.create(
            user=self.user_a,
            name="Past Rome Vacation",
            description="Colosseum and pasta",
            start_date=today - timedelta(days=30),
            end_date=today - timedelta(days=20),
            total_budget=Decimal("1800.00"),
        )
        self.trip_a3_ongoing = Trip.objects.create(
            user=self.user_a,
            name="Ongoing Tokyo Trip",
            description="Shinjuku and sushi",
            start_date=today - timedelta(days=2),
            end_date=today + timedelta(days=5),
            total_budget=Decimal("3000.00"),
        )

        # Create trip for User B
        self.trip_b1 = Trip.objects.create(
            user=self.user_b,
            name="User B London Trip",
            description="Private trip",
            start_date=today + timedelta(days=15),
            end_date=today + timedelta(days=25),
            total_budget=Decimal("1200.00"),
        )

    def authenticate_user(self, user):
        """Helper to set authentication credentials for a user."""
        self.client.force_authenticate(user=user)

    def test_unauthenticated_user_cannot_access_trips(self):
        """Verify unauthenticated requests to /api/v1/trips/ return 401 Unauthorized."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        create_response = self.client.post(
            self.list_create_url,
            {
                "name": "Unauthorized Trip",
                "start_date": "2026-09-01",
                "end_date": "2026-09-10",
                "total_budget": "1000.00",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_trip(self):
        """Verify authenticated user can create a trip and is set as owner."""
        self.authenticate_user(self.user_a)
        payload = {
            "name": "New Barcelona Trip",
            "description": "Beach and Gaudí",
            "start_date": str(self.today + timedelta(days=40)),
            "end_date": str(self.today + timedelta(days=45)),
            "total_budget": "1500.00",
        }
        response = self.client.post(self.list_create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Barcelona Trip")
        self.assertEqual(response.data["user_email"], self.user_a.email)
        self.assertEqual(response.data["status"], "UPCOMING")

        # Verify DB object
        created_trip = Trip.objects.get(id=response.data["id"])
        self.assertEqual(created_trip.user, self.user_a)

    def test_user_sees_only_own_trips(self):
        """Verify User A sees only User A's trips and not User B's trip."""
        self.authenticate_user(self.user_a)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        trip_ids = [t["id"] for t in response.data["results"]]
        self.assertIn(self.trip_a1.id, trip_ids)
        self.assertIn(self.trip_a2_completed.id, trip_ids)
        self.assertIn(self.trip_a3_ongoing.id, trip_ids)
        self.assertNotIn(self.trip_b1.id, trip_ids)

    def test_user_can_retrieve_own_trip_detail(self):
        """Verify User A can retrieve detail for their trip."""
        self.authenticate_user(self.user_a)
        url = reverse("trip-detail", kwargs={"pk": self.trip_a1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Paris Summer Escape")

    def test_user_cannot_retrieve_another_users_trip(self):
        """Verify User A cannot retrieve User B's trip (returns 404 Not Found)."""
        self.authenticate_user(self.user_a)
        url = reverse("trip-detail", kwargs={"pk": self.trip_b1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_update_own_trip(self):
        """Verify User A can patch fields on their own trip."""
        self.authenticate_user(self.user_a)
        url = reverse("trip-detail", kwargs={"pk": self.trip_a1.id})
        payload = {
            "name": "Updated Paris Adventure",
            "total_budget": "3200.50",
        }
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Paris Adventure")
        self.assertEqual(Decimal(response.data["total_budget"]), Decimal("3200.50"))

    def test_user_cannot_update_another_users_trip(self):
        """Verify User A cannot patch User B's trip (returns 404 Not Found)."""
        self.authenticate_user(self.user_a)
        url = reverse("trip-detail", kwargs={"pk": self.trip_b1.id})
        payload = {"name": "Hacked Trip Name"}
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_delete_own_trip(self):
        """Verify User A can delete their trip."""
        self.authenticate_user(self.user_a)
        url = reverse("trip-detail", kwargs={"pk": self.trip_a1.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Trip.objects.filter(id=self.trip_a1.id).exists())

    def test_user_cannot_delete_another_users_trip(self):
        """Verify User A cannot delete User B's trip (returns 404 Not Found)."""
        self.authenticate_user(self.user_a)
        url = reverse("trip-detail", kwargs={"pk": self.trip_b1.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Trip.objects.filter(id=self.trip_b1.id).exists())

    def test_invalid_dates_rejected(self):
        """Verify trip creation with end_date before start_date is rejected with 400."""
        self.authenticate_user(self.user_a)
        payload = {
            "name": "Impossible Trip",
            "start_date": "2026-09-10",
            "end_date": "2026-09-01",
            "total_budget": "500.00",
        }
        response = self.client.post(self.list_create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("end_date", response.data)

    def test_negative_budget_rejected(self):
        """Verify trip creation with negative budget is rejected with 400."""
        self.authenticate_user(self.user_a)
        payload = {
            "name": "Negative Budget Trip",
            "start_date": "2026-09-01",
            "end_date": "2026-09-10",
            "total_budget": "-500.00",
        }
        response = self.client.post(self.list_create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("total_budget", response.data)

    def test_trip_status_calculation(self):
        """Verify status calculation logic returns UPCOMING, ONGOING, and COMPLETED correctly."""
        self.assertEqual(self.trip_a1.status, "UPCOMING")
        self.assertEqual(self.trip_a2_completed.status, "COMPLETED")
        self.assertEqual(self.trip_a3_ongoing.status, "ONGOING")
