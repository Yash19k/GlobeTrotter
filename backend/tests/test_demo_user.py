"""
GlobeTrotter — Demo User Verification Tests

Validates that the seed_demo_user management command produces the exact
dataset specifications required for test@gmail.com.
"""

from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.trips.models import Trip, SharedTrip
from apps.destinations.models import SavedCity, City
from apps.itinerary.models import TripStop, TripActivity
from apps.budget.models import Expense
from services.budget_service import calculate_trip_budget
from services.sharing_service import get_public_trip

User = get_user_model()


class DemoUserDatasetTests(TestCase):
    def setUp(self):
        call_command("seed_demo_user")
        self.user = User.objects.get(email="test@gmail.com")
        self.client = APIClient()

    def test_user_profile(self):
        self.assertEqual(self.user.email, "test@gmail.com")
        self.assertEqual(self.user.first_name, "Yash")
        self.assertEqual(self.user.last_name, "Traveler")
        self.assertEqual(self.user.phone, "+919876543210")
        self.assertEqual(self.user.city, "Ahmedabad")
        self.assertEqual(self.user.country, "India")
        self.assertTrue(self.user.check_password("test1234"))

    def test_trips_count_and_statuses(self):
        trips = Trip.objects.filter(user=self.user).order_by("start_date")
        self.assertEqual(trips.count(), 5)

        trip_names = [t.name for t in trips]
        self.assertIn("European Summer Escape", trip_names)
        self.assertIn("Luxury Japan Adventure", trip_names)
        self.assertIn("Mediterranean Explorer", trip_names)
        self.assertIn("Bali Weekend Escape", trip_names)
        self.assertIn("Tokyo Food Weekend", trip_names)

        # Check completed status on Bali trip
        bali_trip = trips.get(name="Bali Weekend Escape")
        self.assertEqual(bali_trip.status, "COMPLETED")

        # Check upcoming status on Euro trip
        euro_trip = trips.get(name="European Summer Escape")
        self.assertEqual(euro_trip.status, "UPCOMING")

    def test_budget_calculations_and_statuses(self):
        # 1. European Summer Escape (WITHIN_BUDGET)
        euro_trip = Trip.objects.get(user=self.user, name="European Summer Escape")
        euro_budget = calculate_trip_budget(self.user, euro_trip.id)
        self.assertEqual(euro_budget["status"], "WITHIN_BUDGET")
        self.assertLess(float(euro_budget["estimated_total"]), float(euro_trip.total_budget) * 0.8)

        # 2. Luxury Japan Adventure (OVER_BUDGET)
        japan_trip = Trip.objects.get(user=self.user, name="Luxury Japan Adventure")
        japan_budget = calculate_trip_budget(self.user, japan_trip.id)
        self.assertEqual(japan_budget["status"], "OVER_BUDGET")
        self.assertGreater(float(japan_budget["estimated_total"]), float(japan_trip.total_budget))

        # 3. Mediterranean Explorer (NEAR_LIMIT)
        med_trip = Trip.objects.get(user=self.user, name="Mediterranean Explorer")
        med_budget = calculate_trip_budget(self.user, med_trip.id)
        self.assertEqual(med_budget["status"], "NEAR_LIMIT")
        self.assertGreaterEqual(float(med_budget["estimated_total"]), float(med_trip.total_budget) * 0.8)
        self.assertLessEqual(float(med_budget["estimated_total"]), float(med_trip.total_budget))

    def test_activity_times_and_unscheduled(self):
        euro_trip = Trip.objects.get(user=self.user, name="European Summer Escape")
        euro_activities = TripActivity.objects.filter(trip_stop__trip=euro_trip)
        
        timed_acts = euro_activities.filter(start_time__isnull=False)
        unscheduled_acts = euro_activities.filter(start_time__isnull=True)

        self.assertGreaterEqual(timed_acts.count(), 3)
        self.assertGreaterEqual(unscheduled_acts.count(), 1)

        # All test user trips
        all_user_activities = TripActivity.objects.filter(trip_stop__trip__user=self.user)
        total_unscheduled = all_user_activities.filter(start_time__isnull=True).count()
        self.assertGreaterEqual(total_unscheduled, 5)

    def test_saved_cities(self):
        saved = SavedCity.objects.filter(user=self.user)
        self.assertEqual(saved.count(), 7)

    def test_public_sharing_trip1(self):
        euro_trip = Trip.objects.get(user=self.user, name="European Summer Escape")
        self.assertTrue(euro_trip.is_public)
        
        # Verify public sharing service endpoint
        public_data = get_public_trip(euro_trip.share_slug)
        self.assertEqual(public_data["trip"]["name"], "European Summer Escape")
        self.assertEqual(len(public_data["stops"]), 3)

    def test_private_trips_not_public(self):
        japan_trip = Trip.objects.get(user=self.user, name="Luxury Japan Adventure")
        self.assertFalse(japan_trip.is_public)
