from django.contrib import admin
from .models import City, SavedCity


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "region", "cost_index", "popularity_score", "created_at")
    list_filter = ("country", "region", "cost_index")
    search_fields = ("name", "country", "region", "description")
    ordering = ("-popularity_score", "name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(SavedCity)
class SavedCityAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "created_at")
    search_fields = ("user__email", "city__name", "city__country")
    readonly_fields = ("created_at",)
