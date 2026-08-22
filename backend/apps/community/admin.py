from django.contrib import admin
from .models import CommunityPost


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "trip", "created_at")
    search_fields = ("title", "description", "user__email", "trip__name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
