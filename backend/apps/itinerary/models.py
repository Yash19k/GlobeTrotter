"""
GlobeTrotter — Itinerary Models

TripStop and TripActivity models for building day-wise trip itineraries.
"""

from django.core.validators import MinValueValidator
from django.db import models


class TripStop(models.Model):
    """A stop (city visit) within a trip, ordered by stop_order."""

    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="stops",
        db_index=True,
    )
    city = models.ForeignKey(
        "destinations.City",
        on_delete=models.CASCADE,
        related_name="trip_stops",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    stop_order = models.PositiveIntegerField(
        default=1,
        help_text="Sequence of this stop in the trip.",
    )
    transport_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    accommodation_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trip_stops"
        ordering = ["trip", "stop_order"]
        verbose_name = "Trip Stop"
        verbose_name_plural = "Trip Stops"
        indexes = [
            models.Index(fields=["trip", "stop_order"], name="idx_stop_trip_order"),
            models.Index(fields=["city"], name="idx_stop_city"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F("start_date")),
                name="ck_stop_end_after_start",
            ),
            models.CheckConstraint(
                condition=models.Q(transport_cost__gte=0),
                name="ck_stop_transport_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(accommodation_cost__gte=0),
                name="ck_stop_accommodation_non_negative",
            ),
            models.UniqueConstraint(
                fields=["trip", "stop_order"],
                name="uq_stop_trip_order",
            ),
        ]

    def __str__(self):
        return f"Stop {self.stop_order}: {self.city.name} ({self.start_date} → {self.end_date})"


class TripActivity(models.Model):
    """An activity scheduled within a trip stop — references the Activity catalog."""

    trip_stop = models.ForeignKey(
        TripStop,
        on_delete=models.CASCADE,
        related_name="trip_activities",
        db_index=True,
    )
    activity = models.ForeignKey(
        "activities.Activity",
        on_delete=models.CASCADE,
        related_name="trip_usages",
    )
    activity_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    activity_order = models.PositiveIntegerField(
        default=1,
        help_text="Order of this activity within the day.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trip_activities"
        ordering = ["trip_stop", "activity_date", "activity_order"]
        verbose_name = "Trip Activity"
        verbose_name_plural = "Trip Activities"
        indexes = [
            models.Index(
                fields=["trip_stop", "activity_date", "activity_order"],
                name="idx_tripact_stop_date_order",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["trip_stop", "activity", "activity_date"],
                name="uq_tripact_stop_activity_date",
            ),
            models.CheckConstraint(
                condition=models.Q(estimated_cost__gte=0),
                name="ck_tripact_cost_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.activity.name} on {self.activity_date}"
