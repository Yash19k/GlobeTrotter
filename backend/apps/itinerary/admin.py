from django.contrib import admin
from .models import TripStop, TripActivity


@admin.register(TripStop)
class TripStopAdmin(admin.ModelAdmin):
    list_display = ("trip", "city", "stop_order", "start_date", "end_date", "transport_cost", "accommodation_cost")
    list_filter = ("city__country", "start_date")
    search_fields = ("trip__name", "city__name", "notes")
    ordering = ("trip", "stop_order")
    readonly_fields = ("created_at", "updated_at")


@admin.register(TripActivity)
class TripActivityAdmin(admin.ModelAdmin):
    list_display = ("trip_stop", "activity", "activity_date", "start_time", "activity_order", "estimated_cost")
    list_filter = ("activity_date", "activity__category")
    search_fields = ("activity__name", "trip_stop__trip__name", "notes")
    ordering = ("trip_stop", "activity_date", "activity_order")
    readonly_fields = ("created_at", "updated_at")
