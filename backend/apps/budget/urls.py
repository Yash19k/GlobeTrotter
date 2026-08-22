"""
GlobeTrotter — Budget URL Configuration
"""

from django.urls import path
from .views import (
    TripBudgetView,
    TripExpenseListCreateView,
    TripExpenseDetailView,
)

urlpatterns = [
    # Budget Engine
    path("trips/<int:trip_id>/budget/", TripBudgetView.as_view(), name="trip-budget"),

    # Expense CRUD
    path("trips/<int:trip_id>/expenses/", TripExpenseListCreateView.as_view(), name="trip-expense-list-create"),
    path("expenses/<int:pk>/", TripExpenseDetailView.as_view(), name="trip-expense-detail"),
]
