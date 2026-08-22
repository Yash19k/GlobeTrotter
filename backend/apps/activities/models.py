"""
GlobeTrotter — Activity Model

Activities available in cities for itinerary planning.
"""

from django.core.validators import MinValueValidator
from django.db import models


class Activity(models.Model):
    """An activity available in a city (e.g. sightseeing, food, adventure)."""

    class Category(models.TextChoices):
        SIGHTSEEING = "SIGHTSEEING", "Sightseeing"
        FOOD = "FOOD", "Food & Dining"
        ADVENTURE = "ADVENTURE", "Adventure"
        CULTURE = "CULTURE", "Culture & History"
        SHOPPING = "SHOPPING", "Shopping"
        NIGHTLIFE = "NIGHTLIFE", "Nightlife"
        NATURE = "NATURE", "Nature & Outdoors"
        OTHER = "OTHER", "Other"

    city = models.ForeignKey(
        "destinations.City",
        on_delete=models.CASCADE,
        related_name="activities",
        db_index=True,
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.SIGHTSEEING,
        db_index=True,
    )
    duration_minutes = models.PositiveIntegerField(
        default=60,
        help_text="Estimated duration in minutes.",
    )
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    image = models.URLField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "activities"
        ordering = ["city", "category", "name"]
        verbose_name = "Activity"
        verbose_name_plural = "Activities"
        indexes = [
            models.Index(fields=["city", "category"], name="idx_activity_city_cat"),
            models.Index(fields=["estimated_cost"], name="idx_activity_cost"),
        ]

    def __str__(self):
        return f"{self.name} ({self.city.name})"
