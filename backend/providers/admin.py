from django.contrib import admin

from providers.models import ProviderLocation, ProviderProfile


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'verification_status', 'is_online', 'rating', 'total_reviews', 'created_at']
    list_filter = ['verification_status', 'is_online']
    search_fields = ['business_name', 'user__email', 'phone']
    actions = ['approve_providers', 'reject_providers', 'suspend_providers']

    @admin.action(description='Approve selected providers')
    def approve_providers(self, request, queryset):
        queryset.update(verification_status=ProviderProfile.VerificationStatus.APPROVED)

    @admin.action(description='Reject selected providers')
    def reject_providers(self, request, queryset):
        queryset.update(verification_status=ProviderProfile.VerificationStatus.REJECTED)

    @admin.action(description='Suspend selected providers')
    def suspend_providers(self, request, queryset):
        queryset.update(verification_status=ProviderProfile.VerificationStatus.SUSPENDED, is_online=False)


@admin.register(ProviderLocation)
class ProviderLocationAdmin(admin.ModelAdmin):
    list_display = ['provider', 'latitude', 'longitude', 'last_updated']
