"""
GlobeTrotter — Budget Serializers

Serializers for Expense CRUD and Budget API outputs.
"""

from rest_framework import serializers
from apps.budget.models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for explicit Expense CRUD."""

    class Meta:
        model = Expense
        fields = (
            "id",
            "trip",
            "category",
            "amount",
            "description",
            "expense_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "trip", "created_at", "updated_at")


class CategoryBreakdownSerializer(serializers.Serializer):
    transport = serializers.CharField()
    accommodation = serializers.CharField()
    activities = serializers.CharField()
    meals = serializers.CharField()
    other = serializers.CharField()


class StopBudgetBreakdownSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    city_id = serializers.IntegerField()
    city_name = serializers.CharField()
    country = serializers.CharField()
    start_date = serializers.CharField()
    end_date = serializers.CharField()
    transport_cost = serializers.CharField()
    accommodation_cost = serializers.CharField()
    activities_cost = serializers.CharField()
    total_cost = serializers.CharField()


class DailyBudgetBreakdownSerializer(serializers.Serializer):
    date = serializers.CharField()
    day_number = serializers.IntegerField()
    label = serializers.CharField()
    activities_cost = serializers.CharField()
    expenses_cost = serializers.CharField()
    fixed_daily_cost = serializers.CharField()
    total_cost = serializers.CharField()


class TripBudgetResponseSerializer(serializers.Serializer):
    """Output serializer for GET /api/v1/trips/{trip_id}/budget/"""

    trip_id = serializers.IntegerField()
    trip_name = serializers.CharField()
    currency = serializers.CharField()
    total_budget = serializers.CharField()
    estimated_total = serializers.CharField()
    remaining_budget = serializers.CharField()
    budget_used_percentage = serializers.FloatField()
    status = serializers.CharField()
    duration_days = serializers.IntegerField()
    average_daily_cost = serializers.CharField()
    categories = CategoryBreakdownSerializer()
    stops = StopBudgetBreakdownSerializer(many=True)
    days = DailyBudgetBreakdownSerializer(many=True)
