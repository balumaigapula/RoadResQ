from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from reviews.views import CustomerReviewListView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth & profile
    path('api/auth/', include('accounts.urls')),

    # Domain resources
    path('api/vehicles/', include('vehicles.urls')),
    path('api/services/', include('services.urls')),
    path('api/providers/', include('providers.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/customer/reviews/', CustomerReviewListView.as_view(), name='customer-reviews'),
    path('api/invoices/', include('invoices.urls')),
    path('api/ai/', include('ai_assistant.urls')),

    # Assistance workflow — split by actor, per the frontend's route structure
    path('api/assistance/', include('assistance.urls_assistance')),
    path('api/customer/', include('assistance.urls_customer')),
    path('api/provider/', include('assistance.urls_provider')),

    # Admin application
    path('api/admin/', include('dashboard.urls')),

    # API docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
