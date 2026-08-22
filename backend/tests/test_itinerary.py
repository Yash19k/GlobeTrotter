"""
GlobeTrotter — Itinerary Unit Tests

Unit test suite covering full itinerary retrieval, stop CRUD & date/overlap validation,
activity scheduling & city/date validation, reordering, cascading deletes, and ownership isolation.
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


class ItineraryAPITests(APITestCase):
    """Test suite for Itinerary builder APIs and business logic validation."""

    def setUp(self):
        self.user_a = User.objects.create_user(
            email="user_a@example.com",
            password="Password123!",
            first_name="Alice",
        )
        self.user_b = User.objects.create_user(
            email="user_b@example.com",
            password="Password123!",
            first_name="Bob",
        )
        self.client.force_authenticate(user=self.user_a)

        # Cities
        self.paris = City.objects.create(name="Paris", country="France", cost_index=4)
        self.rome = City.objects.create(name="Rome", country="Italy", cost_index=3)

        # Catalog Activities
        self.eiffel = Activity.objects.create(
            city=self.paris,
            name="Eiffel Tower Tour",
            category=Activity.Category.SIGHTSEEING,
            duration_minutes=120,
            estimated_cost=Decimal("35.00"),
        )
        self.louvre = Activity.objects.create(
            city=self.paris,
            name="Louvre Museum Visit",
            category=Activity.Category.CULTURE,
            duration_minutes=180,
            estimated_cost=Decimal("22.00"),
        )
        self.colosseum = Activity.objects.create(
            city=self.rome,
            name="Colosseum Tour",
            category=Activity.Category.CULTURE,
            duration_minutes=120,
            estimated_cost=Decimal("30.00"),
        )

        # User A Trip: Aug 10 to Aug 25, 2026
        self.trip_a = Trip.objects.create(
            user=self.user_a,
            name="European Vacation",
            start_date="2026-08-10",
            end_date="2026-08-25",
            total_budget=Decimal("2500.00"),
        )

        # User B Trip
        self.trip_b = Trip.objects.create(
            user=self.user_b,
            name="Bob's Solo Trip",
            start_date="2026-08-10",
            end_date="2026-08-20",
            total_budget=Decimal("1000.00"),
        )

    # 1. Authenticated user can retrieve itinerary
    def test_authenticated_user_can_retrieve_itinerary(self):
        url = reverse("trip-itinerary", kwargs={"trip_id": self.trip_a.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["trip"]["name"], "European Vacation")
        self.assertEqual(len(response.data["stops"]), 0)

    # 2. Unauthenticated user rejected
    def test_unauthenticated_user_rejected(self):
        self.client.force_authenticate(user=None)
        url = reverse("trip-itinerary", kwargs={"trip_id": self.trip_a.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 3. User cannot retrieve another user's itinerary
    def test_user_cannot_retrieve_another_users_itinerary(self):
        url = reverse("trip-itinerary", kwargs={"trip_id": self.trip_b.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 4. User can add stop
    def test_user_can_add_stop(self):
        url = reverse("trip-stop-create", kwargs={"trip_id": self.trip_a.id})
        payload = {
            "city_id": self.paris.id,
            "start_date": "2026-08-10",
            "end_date": "2026-08-15",
            "transport_cost": "100.00",
            "accommodation_cost": "300.00",
            "notes": "Arrive in Paris",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["city"]["name"], "Paris")
        self.assertEqual(response.data["stop_order"], 1)

    # 5. Invalid stop date rejected (outside trip or end < start)
    def test_invalid_stop_dates_rejected(self):
        url = reverse("trip-stop-create", kwargs={"trip_id": self.trip_a.id})
        payload = {
            "city_id": self.paris.id,
            "start_date": "2026-08-15",
            "end_date": "2026-08-10",  # end < start
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 6. Stop outside trip rejected
    def test_stop_outside_trip_dates_rejected(self):
        url = reverse("trip-stop-create", kwargs={"trip_id": self.trip_a.id})
        payload = {
            "city_id": self.paris.id,
            "start_date": "2026-08-01",  # Before trip start (2026-08-10)
            "end_date": "2026-08-12",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 7. Overlapping stops rejected
    def test_overlapping_stops_rejected(self):
        url = reverse("trip-stop-create", kwargs={"trip_id": self.trip_a.id})
        # Create Stop 1: Aug 10 - Aug 15
        self.client.post(url, {"city_id": self.paris.id, "start_date": "2026-08-10", "end_date": "2026-08-15"}, format="json")

        # Attempt Stop 2 overlapping: Aug 14 - Aug 18
        response = self.client.post(url, {"city_id": self.rome.id, "start_date": "2026-08-14", "end_date": "2026-08-18"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 8. User can update stop
    def test_user_can_update_stop(self):
        stop = TripStop.objects.create(
            trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1
        )
        url = reverse("trip-stop-detail", kwargs={"stop_id": stop.id})
        response = self.client.patch(url, {"notes": "Updated Paris notes"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["notes"], "Updated Paris notes")

    # 9. User can delete stop
    def test_user_can_delete_stop(self):
        stop = TripStop.objects.create(
            trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1
        )
        url = reverse("trip-stop-detail", kwargs={"stop_id": stop.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TripStop.objects.filter(pk=stop.id).exists())

    # 10. Stop reorder works & normalizes
    def test_stop_reorder_works(self):
        s1 = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        s2 = TripStop.objects.create(trip=self.trip_a, city=self.rome, start_date="2026-08-15", end_date="2026-08-20", stop_order=2)

        url = reverse("trip-stop-reorder")
        response = self.client.patch(url, {"trip_id": self.trip_a.id, "stop_ids": [s2.id, s1.id]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        s1.refresh_from_db()
        s2.refresh_from_db()
        self.assertEqual(s2.stop_order, 1)
        self.assertEqual(s1.stop_order, 2)

    # 11. Unauthorized stop update rejected
    def test_unauthorized_stop_update_rejected(self):
        stop_b = TripStop.objects.create(trip=self.trip_b, city=self.rome, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        url = reverse("trip-stop-detail", kwargs={"stop_id": stop_b.id})
        response = self.client.patch(url, {"notes": "Hack notes"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # 12. User can add activity
    def test_user_can_add_activity(self):
        stop = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        url = reverse("trip-activity-create", kwargs={"stop_id": stop.id})
        payload = {
            "activity_id": self.eiffel.id,
            "activity_date": "2026-08-12",
            "start_time": "09:00",
            "notes": "Morning tour",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["activity"]["name"], "Eiffel Tower Tour")
        self.assertEqual(Decimal(str(response.data["estimated_cost"])), Decimal("35.00"))

    # 13. Activity-city mismatch rejected
    def test_activity_city_mismatch_rejected(self):
        stop_paris = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        url = reverse("trip-activity-create", kwargs={"stop_id": stop_paris.id})
        # Attempt to add Rome's Colosseum to Paris stop
        payload = {
            "activity_id": self.colosseum.id,
            "activity_date": "2026-08-12",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 14. Activity date outside stop rejected
    def test_activity_date_outside_stop_rejected(self):
        stop_paris = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        url = reverse("trip-activity-create", kwargs={"stop_id": stop_paris.id})
        payload = {
            "activity_id": self.eiffel.id,
            "activity_date": "2026-08-18",  # After stop end (Aug 15)
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 15. User can update activity
    def test_user_can_update_activity(self):
        stop = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        act = TripActivity.objects.create(trip_stop=stop, activity=self.eiffel, activity_date="2026-08-12", estimated_cost=Decimal("35.00"))
        url = reverse("trip-activity-detail", kwargs={"pk": act.id})
        response = self.client.patch(url, {"notes": "VIP Entry booked"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["notes"], "VIP Entry booked")

    # 16. User can delete activity
    def test_user_can_delete_activity(self):
        stop = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        act = TripActivity.objects.create(trip_stop=stop, activity=self.eiffel, activity_date="2026-08-12", estimated_cost=Decimal("35.00"))
        url = reverse("trip-activity-detail", kwargs={"pk": act.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TripActivity.objects.filter(pk=act.id).exists())

    # 17. Activity reorder works
    def test_activity_reorder_works(self):
        stop = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        a1 = TripActivity.objects.create(trip_stop=stop, activity=self.eiffel, activity_date="2026-08-12", activity_order=1)
        a2 = TripActivity.objects.create(trip_stop=stop, activity=self.louvre, activity_date="2026-08-12", activity_order=2)

        url = reverse("trip-activity-reorder")
        response = self.client.patch(url, {"stop_id": stop.id, "activity_ids": [a2.id, a1.id]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        a1.refresh_from_db()
        a2.refresh_from_db()
        self.assertEqual(a2.activity_order, 1)
        self.assertEqual(a1.activity_order, 2)

    # 18. Unauthorized activity update rejected
    def test_unauthorized_activity_update_rejected(self):
        stop_b = TripStop.objects.create(trip=self.trip_b, city=self.rome, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        act_b = TripActivity.objects.create(trip_stop=stop_b, activity=self.colosseum, activity_date="2026-08-12")

        url = reverse("trip-activity-detail", kwargs={"pk": act_b.id})
        response = self.client.patch(url, {"notes": "Unauthorized edit"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # 19. Stop deletion cascades activities & normalizes stop orders
    def test_stop_deletion_cascades_activities(self):
        s1 = TripStop.objects.create(trip=self.trip_a, city=self.paris, start_date="2026-08-10", end_date="2026-08-15", stop_order=1)
        s2 = TripStop.objects.create(trip=self.trip_a, city=self.rome, start_date="2026-08-15", end_date="2026-08-20", stop_order=2)
        act = TripActivity.objects.create(trip_stop=s1, activity=self.eiffel, activity_date="2026-08-12")

        # Delete s1
        url = reverse("trip-stop-detail", kwargs={"stop_id": s1.id})
        self.client.delete(url)

        self.assertFalse(TripActivity.objects.filter(pk=act.id).exists())
        s2.refresh_from_db()
        self.assertEqual(s2.stop_order, 1)
