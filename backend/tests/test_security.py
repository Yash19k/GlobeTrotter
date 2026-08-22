"""
GlobeTrotter — Security, Hardening & Negative Unit Tests

Comprehensive test suite verifying ownership isolation, negative/malicious payload rejection,
health checks, public/private boundary enforcement, and data integrity.
"""

from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.destinations.models import City
from apps.activities.models import Activity
from apps.trips.models import Trip
from apps.itinerary.models import TripStop, TripActivity

User = get_user_model()


class SecurityHardeningAPITests(APITestCase):
    """Test suite for authorization boundaries, input hardening, and negative scenarios."""

    def setUp(self):
        self.user_a = User.objects.create_user(
            email="victim_a@example.com",
            password="Password123!",
            first_name="Alice",
        )
        self.user_b = User.objects.create_user(
            email="attacker_b@example.com",
            password="Password123!",
            first_name="Bob",
        )

        self.paris = City.objects.create(name="Paris", country="France", cost_index=4)
        self.eiffel = Activity.objects.create(
            city=self.paris,
            name="Eiffel Tower",
            category=Activity.Category.SIGHTSEEING,
            duration_minutes=120,
            estimated_cost=Decimal("35.00"),
        )

        # User A's private trip
        self.trip_a = Trip.objects.create(
            user=self.user_a,
            name="Alice's Private Vacation",
            start_date="2026-08-10",
            end_date="2026-08-20",
            total_budget=Decimal("3000.00"),
            is_public=False,
        )

        self.stop_a = TripStop.objects.create(
            trip=self.trip_a,
            city=self.paris,
            start_date="2026-08-10",
            end_date="2026-08-15",
            stop_order=1,
            transport_cost=Decimal("200.00"),
            accommodation_cost=Decimal("500.00"),
        )

        self.act_a = TripActivity.objects.create(
            trip_stop=self.stop_a,
            activity=self.eiffel,
            activity_date="2026-08-11",
            estimated_cost=Decimal("35.00"),
            activity_order=1,
        )

    # 1. Health check returns healthy
    def test_health_check_endpoint(self):
        url = reverse("health-check")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "healthy"})

    # 2. User B cannot view User A's private trip
    def test_user_b_cannot_get_user_a_trip(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-detail", kwargs={"pk": self.trip_a.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 3. User B cannot update User A's trip
    def test_user_b_cannot_update_user_a_trip(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-detail", kwargs={"pk": self.trip_a.id})
        response = self.client.patch(url, {"name": "Hacked Title"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.trip_a.refresh_from_db()
        self.assertEqual(self.trip_a.name, "Alice's Private Vacation")

    # 4. User B cannot delete User A's trip
    def test_user_b_cannot_delete_user_a_trip(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-detail", kwargs={"pk": self.trip_a.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Trip.objects.filter(pk=self.trip_a.id).exists())

    # 5. User B cannot create stop in User A's trip
    def test_user_b_cannot_create_stop_in_user_a_trip(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-stop-create", kwargs={"trip_id": self.trip_a.id})
        payload = {
            "city_id": self.paris.id,
            "start_date": "2026-08-10",
            "end_date": "2026-08-15",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 6. User B cannot update User A's stop
    def test_user_b_cannot_update_user_a_stop(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-stop-detail", kwargs={"stop_id": self.stop_a.id})
        response = self.client.patch(url, {"transport_cost": "999.00"}, format="json")
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

    # 7. User B cannot delete User A's stop
    def test_user_b_cannot_delete_user_a_stop(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-stop-detail", kwargs={"stop_id": self.stop_a.id})
        response = self.client.delete(url)
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])
        self.assertTrue(TripStop.objects.filter(pk=self.stop_a.id).exists())

    # 8. User B cannot view User A's budget
    def test_user_b_cannot_view_user_a_budget(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-budget", kwargs={"trip_id": self.trip_a.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 9. User B cannot publish User A's trip
    def test_user_b_cannot_publish_user_a_trip(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-publish", kwargs={"trip_id": self.trip_a.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 10. Invalid date range rejected (end_date < start_date)
    def test_invalid_date_range_rejected(self):
        self.client.force_authenticate(user=self.user_a)
        url = reverse("trip-list-create")
        payload = {
            "name": "Invalid Date Trip",
            "start_date": "2026-08-20",
            "end_date": "2026-08-10",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 11. Negative monetary budget rejected
    def test_negative_budget_rejected(self):
        self.client.force_authenticate(user=self.user_a)
        url = reverse("trip-list-create")
        payload = {
            "name": "Negative Budget Trip",
            "start_date": "2026-08-10",
            "end_date": "2026-08-20",
            "total_budget": "-500.00",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 12. Nonexistent trip ID returns 404
    def test_nonexistent_trip_returns_404(self):
        self.client.force_authenticate(user=self.user_a)
        url = reverse("trip-detail", kwargs={"pk": 999999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 13. Nonexistent public slug returns 404
    def test_nonexistent_public_slug_returns_404(self):
        url = reverse("public-trip-detail", kwargs={"slug": "fake-nonexistent-slug-1234"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
