"""
GlobeTrotter — Budget Models

Expense tracking for trip budget management.
"""

from django.core.validators import MinValueValidator
from django.db import models


class Expense(models.Model):
    """An expense associated with a trip, categorized for budget analysis."""

    class Category(models.TextChoices):
        TRANSPORT = "TRANSPORT", "Transport"
        ACCOMMODATION = "ACCOMMODATION", "Accommodation"
        ACTIVITY = "ACTIVITY", "Activity"
        MEAL = "MEAL", "Meal"
        OTHER = "OTHER", "Other"

    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="expenses",
        db_index=True,
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
        db_index=True,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    description = models.CharField(max_length=300, blank=True)
    expense_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "expenses"
        ordering = ["trip", "expense_date"]
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"
        indexes = [
            models.Index(fields=["trip", "category"], name="idx_expense_trip_cat"),
            models.Index(fields=["trip", "expense_date"], name="idx_expense_trip_date"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gte=0),
                name="ck_expense_amount_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.get_category_display()}: ${self.amount} ({self.expense_date})"
