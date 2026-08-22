"""
GlobeTrotter — Sharing & Community Unit Tests

Tests covering public trip publishing/unpublishing, unique share slugs, read-only public endpoints,
security filtering, deep-copying trips into user accounts, and community discovery pagination.
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


class CommunitySharingAPITests(APITestCase):
    """Test suite for public sharing, read-only public viewing, deep copy, and community feed."""

    def setUp(self):
        self.user_a = User.objects.create_user(
            email="owner_a@example.com",
            password="Password123!",
            first_name="Alice",
        )
        self.user_b = User.objects.create_user(
            email="user_b@example.com",
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

        # Alice's Trip
        self.trip_a = Trip.objects.create(
            user=self.user_a,
            name="Alice's Paris Escape",
            description="A magical trip to Paris.",
            start_date="2026-08-10",
            end_date="2026-08-15",
            total_budget=Decimal("2000.00"),
            is_public=False,
        )
        self.stop_a = TripStop.objects.create(
            trip=self.trip_a,
            city=self.paris,
            start_date="2026-08-10",
            end_date="2026-08-15",
            stop_order=1,
            transport_cost=Decimal("150.00"),
            accommodation_cost=Decimal("400.00"),
        )
        self.act_a = TripActivity.objects.create(
            trip_stop=self.stop_a,
            activity=self.eiffel,
            activity_date="2026-08-11",
            start_time="10:00",
            estimated_cost=Decimal("35.00"),
            activity_order=1,
        )

    # 1. Owner can publish trip
    def test_owner_can_publish_trip(self):
        self.client.force_authenticate(user=self.user_a)
        url = reverse("trip-publish", kwargs={"trip_id": self.trip_a.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_public"])
        self.assertIn("share_slug", response.data)

        self.trip_a.refresh_from_db()
        self.assertTrue(self.trip_a.is_public)

    # 2. Non-owner cannot publish trip
    def test_non_owner_cannot_publish_trip(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-publish", kwargs={"trip_id": self.trip_a.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 3. Owner can unpublish trip
    def test_owner_can_unpublish_trip(self):
        self.client.force_authenticate(user=self.user_a)
        self.client.post(reverse("trip-publish", kwargs={"trip_id": self.trip_a.id}))

        url = reverse("trip-unpublish", kwargs={"trip_id": self.trip_a.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_public"])

        self.trip_a.refresh_from_db()
        self.assertFalse(self.trip_a.is_public)

    # 4. Non-owner cannot unpublish
    def test_non_owner_cannot_unpublish(self):
        self.client.force_authenticate(user=self.user_b)
        url = reverse("trip-unpublish", kwargs={"trip_id": self.trip_a.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 5. Public trip accessible without authentication
    def test_public_trip_accessible_without_auth(self):
        self.client.force_authenticate(user=self.user_a)
        pub_res = self.client.post(reverse("trip-publish", kwargs={"trip_id": self.trip_a.id}))
        slug = pub_res.data["share_slug"]

        # Logout completely
        self.client.force_authenticate(user=None)
        url = reverse("public-trip-detail", kwargs={"slug": slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["trip"]["name"], "Alice's Paris Escape")
        self.assertEqual(response.data["creator"]["first_name"], "Alice")
        self.assertEqual(len(response.data["stops"]), 1)

    # 6. Private trip returns 404 publicly
    def test_private_trip_returns_404_publicly(self):
        self.client.force_authenticate(user=None)
        url = reverse("public-trip-detail", kwargs={"slug": self.trip_a.share_slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 7. Public response omits sensitive user details
    def test_public_response_omits_sensitive_data(self):
        self.client.force_authenticate(user=self.user_a)
        pub_res = self.client.post(reverse("trip-publish", kwargs={"trip_id": self.trip_a.id}))
        slug = pub_res.data["share_slug"]

        self.client.force_authenticate(user=None)
        url = reverse("public-trip-detail", kwargs={"slug": slug})
        response = self.client.get(url)
        data = response.data
        self.assertNotIn("email", data["creator"])
        self.assertNotIn("password", data["creator"])

    # 8. Authenticated user can copy public trip
    def test_authenticated_user_can_copy_public_trip(self):
        self.client.force_authenticate(user=self.user_a)
        pub_res = self.client.post(reverse("trip-publish", kwargs={"trip_id": self.trip_a.id}))
        slug = pub_res.data["share_slug"]

        # Log in as User B and copy Alice's trip
        self.client.force_authenticate(user=self.user_b)
        copy_url = reverse("public-trip-copy", kwargs={"slug": slug})
        response = self.client.post(copy_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_trip_id = response.data["id"]

        new_trip = Trip.objects.get(pk=new_trip_id)
        self.assertEqual(new_trip.user, self.user_b)
        self.assertFalse(new_trip.is_public)  # MUST BE PRIVATE BY DEFAULT
        self.assertEqual(new_trip.name, "Copy of Alice's Paris Escape")

        # Check stops and activities copied
        stops = new_trip.stops.all()
        self.assertEqual(len(stops), 1)
        self.assertEqual(stops[0].city, self.paris)  # Master City reused

        activities = stops[0].trip_activities.all()
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0].activity, self.eiffel)  # Master Activity reused

    # 9. Unauthenticated user cannot copy trip
    def test_unauthenticated_user_cannot_copy(self):
        self.client.force_authenticate(user=self.user_a)
        pub_res = self.client.post(reverse("trip-publish", kwargs={"trip_id": self.trip_a.id}))
        slug = pub_res.data["share_slug"]

        self.client.force_authenticate(user=None)
        copy_url = reverse("public-trip-copy", kwargs={"slug": slug})
        response = self.client.post(copy_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 10. Master records not duplicated during copy
    def test_master_records_not_duplicated_on_copy(self):
        city_count_before = City.objects.count()
        activity_count_before = Activity.objects.count()

        self.client.force_authenticate(user=self.user_a)
        pub_res = self.client.post(reverse("trip-publish", kwargs={"trip_id": self.trip_a.id}))
        slug = pub_res.data["share_slug"]

        self.client.force_authenticate(user=self.user_b)
        self.client.post(reverse("public-trip-copy", kwargs={"slug": slug}))

        self.assertEqual(City.objects.count(), city_count_before)
        self.assertEqual(Activity.objects.count(), activity_count_before)

    # 11. Community feed lists public trips only
    def test_community_feed_lists_public_trips_only(self):
        # Alice publishes trip_a
        self.client.force_authenticate(user=self.user_a)
        self.client.post(reverse("trip-publish", kwargs={"trip_id": self.trip_a.id}))

        # Create User B private trip
        Trip.objects.create(
            user=self.user_b,
            name="Bob's Private Secret Trip",
            start_date="2026-09-01",
            end_date="2026-09-05",
            is_public=False,
        )

        self.client.force_authenticate(user=None)
        url = reverse("community-trips")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Alice's Paris Escape")
