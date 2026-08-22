"""
GlobeTrotter — Trip Models

Trip and SharedTrip models for travel plan management.
"""

import uuid
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Trip(models.Model):
    """A multi-city travel plan owned by a user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trips",
        db_index=True,
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cover_image = models.URLField(max_length=500, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    total_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    is_public = models.BooleanField(default=False)
    share_slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text="Unique slug for public sharing.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trips"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-start_date"], name="idx_trip_user_start"),
            models.Index(fields=["start_date", "end_date"], name="idx_trip_dates"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F("start_date")),
                name="ck_trip_end_after_start",
            ),
            models.CheckConstraint(
                condition=models.Q(total_budget__gte=0),
                name="ck_trip_budget_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.start_date} → {self.end_date})"

    def save(self, *args, **kwargs):
        if not self.share_slug:
            self.share_slug = uuid.uuid4().hex[:12]
        super().save(*args, **kwargs)


class SharedTrip(models.Model):
    """Public sharing record for a trip with a unique slug."""

    trip = models.OneToOneField(
        Trip,
        on_delete=models.CASCADE,
        related_name="shared",
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "shared_trips"
        verbose_name = "Shared Trip"
        verbose_name_plural = "Shared Trips"

    def __str__(self):
        return f"Shared: {self.trip.name} → /{self.slug}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = uuid.uuid4().hex[:12]
        super().save(*args, **kwargs)
