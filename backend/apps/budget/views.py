"""
GlobeTrotter — Budget Views

API endpoints for financial calculation metrics and Expense CRUD.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.budget.models import Expense
from apps.budget.serializers import (
    TripBudgetResponseSerializer,
    ExpenseSerializer,
)
from services import budget_service


class TripBudgetView(APIView):
    """
    GET /api/v1/trips/{trip_id}/budget/
    Retrieve complete financial metrics, category breakdown, city stop breakdown,
    daily costs, and budget status for a trip.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get trip budget metrics",
        description="Retrieve comprehensive financial calculations including category breakdown, city breakdown, daily breakdown, and status.",
        responses={200: TripBudgetResponseSerializer},
    )
    def get(self, request, trip_id: int):
        budget_data = budget_service.calculate_trip_budget(request.user, trip_id)
        serializer = TripBudgetResponseSerializer(budget_data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TripExpenseListCreateView(APIView):
    """
    GET /api/v1/trips/{trip_id}/expenses/
    POST /api/v1/trips/{trip_id}/expenses/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List trip expenses",
        responses={200: ExpenseSerializer(many=True)},
    )
    def get(self, request, trip_id: int):
        trip = budget_service.get_user_trip(request.user, trip_id)
        expenses = Expense.objects.filter(trip=trip).order_by("-expense_date")
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Add trip expense",
        responses={201: ExpenseSerializer},
    )
    def post(self, request, trip_id: int):
        expense = budget_service.add_expense(request.user, trip_id, request.data)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TripExpenseDetailView(APIView):
    """
    DELETE /api/v1/expenses/{pk}/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Delete expense",
        responses={204: None},
    )
    def delete(self, request, pk: int):
        budget_service.delete_expense(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
