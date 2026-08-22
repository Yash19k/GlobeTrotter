from django.contrib import admin
from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "category", "duration_minutes", "estimated_cost", "created_at")
    list_filter = ("category", "city__country", "city")
    search_fields = ("name", "description", "city__name")
    ordering = ("city", "category", "name")
    readonly_fields = ("created_at", "updated_at")
