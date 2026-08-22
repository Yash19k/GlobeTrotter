"""
GlobeTrotter — Budget Unit Tests

Unit tests covering budget calculations, status thresholds (WITHIN_BUDGET, NEAR_LIMIT, OVER_BUDGET),
category breakdown, city stop breakdown, daily breakdown, zero-budget safety, and access control.
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
from apps.budget.models import Expense

User = get_user_model()


class BudgetAPITests(APITestCase):
    """Test suite for Budget Engine calculations and API endpoint."""

    def setUp(self):
        self.user_a = User.objects.create_user(
            email="budget_user_a@example.com",
            password="Password123!",
            first_name="BudgetTester",
        )
        self.user_b = User.objects.create_user(
            email="budget_user_b@example.com",
            password="Password123!",
            first_name="OtherUser",
        )
        self.client.force_authenticate(user=self.user_a)

        # Cities & Catalog Activities
        self.paris = City.objects.create(name="Paris", country="France", cost_index=4)
        self.rome = City.objects.create(name="Rome", country="Italy", cost_index=3)

        self.eiffel = Activity.objects.create(
            city=self.paris,
            name="Eiffel Tower",
            category=Activity.Category.SIGHTSEEING,
            duration_minutes=120,
            estimated_cost=Decimal("35.00"),
        )
        self.ramen = Activity.objects.create(
            city=self.paris,
            name="Paris Food Tasting",
            category=Activity.Category.FOOD,
            duration_minutes=90,
            estimated_cost=Decimal("25.00"),
        )

        # User A Trip: $1000 budget, 4 days (Aug 10 - Aug 13, 2026)
        self.trip = Trip.objects.create(
            user=self.user_a,
            name="Summer Budget Trip",
            start_date="2026-08-10",
            end_date="2026-08-13",
            total_budget=Decimal("1000.00"),
        )

        # User B Trip
        self.trip_b = Trip.objects.create(
            user=self.user_b,
            name="Bob's Private Trip",
            start_date="2026-08-10",
            end_date="2026-08-15",
            total_budget=Decimal("500.00"),
        )

        # Create Paris Stop (Aug 10 - Aug 13): Transport $100, Accommodation $300
        self.stop = TripStop.objects.create(
            trip=self.trip,
            city=self.paris,
            start_date="2026-08-10",
            end_date="2026-08-13",
            stop_order=1,
            transport_cost=Decimal("100.00"),
            accommodation_cost=Decimal("300.00"),
        )

        # Schedule Activities
        TripActivity.objects.create(
            trip_stop=self.stop,
            activity=self.eiffel,
            activity_date="2026-08-11",
            estimated_cost=Decimal("35.00"),
            activity_order=1,
        )
        TripActivity.objects.create(
            trip_stop=self.stop,
            activity=self.ramen,
            activity_date="2026-08-11",
            estimated_cost=Decimal("25.00"),
            activity_order=2,
        )

        # Explicit Expense: $40 Meal
        Expense.objects.create(
            trip=self.trip,
            category=Expense.Category.MEAL,
            amount=Decimal("40.00"),
            expense_date="2026-08-12",
            description="Welcome Dinner",
        )

    # 1. Authenticated user can retrieve budget
    def test_authenticated_user_can_retrieve_budget(self):
        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["trip_name"], "Summer Budget Trip")

    # 2. Unauthenticated user rejected
    def test_unauthenticated_user_rejected(self):
        self.client.force_authenticate(user=None)
        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 3. User cannot retrieve another user's budget
    def test_user_cannot_retrieve_another_users_budget(self):
        url = reverse("trip-budget", kwargs={"trip_id": self.trip_b.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 4. Total calculation accuracy (100 transport + 300 lodging + 35 sightseeing + 25 food + 40 meal = 500)
    def test_budget_calculations_accuracy(self):
        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(Decimal(data["estimated_total"]), Decimal("500.00"))
        self.assertEqual(Decimal(data["remaining_budget"]), Decimal("500.00"))
        self.assertEqual(data["budget_used_percentage"], 50.0)
        self.assertEqual(data["status"], "WITHIN_BUDGET")
        self.assertEqual(data["duration_days"], 4)
        self.assertEqual(Decimal(data["average_daily_cost"]), Decimal("125.00"))

        # Check Category Breakdown
        cats = data["categories"]
        self.assertEqual(Decimal(cats["transport"]), Decimal("100.00"))
        self.assertEqual(Decimal(cats["accommodation"]), Decimal("300.00"))
        self.assertEqual(Decimal(cats["activities"]), Decimal("35.00"))
        self.assertEqual(Decimal(cats["meals"]), Decimal("65.00"))  # 25 food activity + 40 meal expense

    # 5. Near limit status (>= 80% used)
    def test_near_limit_status(self):
        # Update trip budget to $600 (500 / 600 = 83.33% -> NEAR_LIMIT)
        self.trip.total_budget = Decimal("600.00")
        self.trip.save()

        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.data["status"], "NEAR_LIMIT")

    # 6. Over budget status (> 100% used)
    def test_over_budget_status(self):
        # Update trip budget to $400 (500 / 400 = 125% -> OVER_BUDGET)
        self.trip.total_budget = Decimal("400.00")
        self.trip.save()

        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.data["status"], "OVER_BUDGET")
        self.assertEqual(Decimal(response.data["remaining_budget"]), Decimal("-100.00"))

    # 7. Zero budget safety (no ZeroDivisionError)
    def test_zero_budget_handled_safely(self):
        self.trip.total_budget = Decimal("0.00")
        self.trip.save()

        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "OVER_BUDGET")

    # 8. Stop breakdown details
    def test_stop_breakdown_details(self):
        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        stops = response.data["stops"]
        self.assertEqual(len(stops), 1)
        self.assertEqual(stops[0]["city_name"], "Paris")
        self.assertEqual(Decimal(stops[0]["total_cost"]), Decimal("460.00"))  # 100 + 300 + 60

    # 9. Daily breakdown details
    def test_daily_breakdown_details(self):
        url = reverse("trip-budget", kwargs={"trip_id": self.trip.id})
        response = self.client.get(url)
        days = response.data["days"]
        self.assertEqual(len(days), 4)
        # Aug 11 has Eiffel (35) + Ramen (25) = 60 activities cost
        day2 = next(d for d in days if d["date"] == "2026-08-11")
        self.assertEqual(Decimal(day2["activities_cost"]), Decimal("60.00"))

    # 10. Expense CRUD
    def test_expense_crud(self):
        url = reverse("trip-expense-list-create", kwargs={"trip_id": self.trip.id})
        res = self.client.post(
            url,
            {"category": "OTHER", "amount": "50.00", "description": "Souvenirs", "expense_date": "2026-08-11"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        exp_id = res.data["id"]

        # Re-fetch budget -> total should now be 550
        b_res = self.client.get(reverse("trip-budget", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(Decimal(b_res.data["estimated_total"]), Decimal("550.00"))

        # Delete expense
        del_res = self.client.delete(reverse("trip-expense-detail", kwargs={"pk": exp_id}))
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)
