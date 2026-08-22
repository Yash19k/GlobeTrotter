from django.contrib import admin
from .models import Trip, SharedTrip


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "start_date", "end_date", "total_budget", "is_public", "share_slug", "created_at")
    list_filter = ("is_public", "start_date", "end_date")
    search_fields = ("name", "description", "user__email", "share_slug")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "share_slug")


@admin.register(SharedTrip)
class SharedTripAdmin(admin.ModelAdmin):
    list_display = ("trip", "slug", "created_at")
    search_fields = ("trip__name", "slug")
    readonly_fields = ("created_at", "updated_at")
