from django.urls import path

from locations.views import ReverseGeocodeView

urlpatterns = [
    path('reverse-geocode/', ReverseGeocodeView.as_view(), name='reverse-geocode'),
]
