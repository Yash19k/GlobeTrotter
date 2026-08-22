from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("trip", "category", "amount", "description", "expense_date", "created_at")
    list_filter = ("category", "expense_date")
    search_fields = ("trip__name", "description")
    ordering = ("trip", "expense_date")
    readonly_fields = ("created_at", "updated_at")
