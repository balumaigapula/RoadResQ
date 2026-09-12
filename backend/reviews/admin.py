from django.contrib import admin

from reviews.models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['provider', 'customer', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['provider__business_name', 'customer__email']
