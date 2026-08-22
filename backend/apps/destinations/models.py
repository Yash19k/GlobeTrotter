"""
GlobeTrotter — Destination Models

City and SavedCity models for destination management.
"""

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class City(models.Model):
    """A travel destination city with metadata for discovery and filtering."""

    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100, db_index=True)
    region = models.CharField(max_length=100, blank=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.URLField(max_length=500, blank=True)
    cost_index = models.PositiveSmallIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Cost level 1 (cheapest) to 5 (most expensive).",
    )
    popularity_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text="Popularity rating 0.0 to 10.0.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cities"
        ordering = ["-popularity_score", "name"]
        verbose_name = "City"
        verbose_name_plural = "Cities"
        constraints = [
            models.UniqueConstraint(
                fields=["name", "country"],
                name="uq_city_name_country",
            ),
        ]
        indexes = [
            models.Index(fields=["name"], name="idx_city_name"),
            models.Index(fields=["-popularity_score"], name="idx_city_popularity"),
        ]

    def __str__(self):
        return f"{self.name}, {self.country}"


class SavedCity(models.Model):
    """A user's bookmarked/saved city — prevents duplicates via constraint."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_cities",
    )
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name="saved_by",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "saved_cities"
        verbose_name = "Saved City"
        verbose_name_plural = "Saved Cities"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "city"],
                name="uq_saved_city_user_city",
            ),
        ]

    def __str__(self):
        return f"{self.user.email} → {self.city.name}"
