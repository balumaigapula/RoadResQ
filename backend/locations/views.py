import requests
from django.conf import settings
from rest_framework.views import APIView

from common.response import error, success


class ReverseGeocodeView(APIView):
    """
    POST /api/locations/reverse-geocode/  { "latitude": .., "longitude": .. }

    Server-side only — the Google Maps API key never reaches the frontend
    bundle. Falls back to a coordinate-only response if no key is configured,
    matching the frontend's existing graceful-degradation behaviour.
    """

    def post(self, request):
        try:
            lat = float(request.data.get('latitude'))
            lng = float(request.data.get('longitude'))
        except (TypeError, ValueError):
            return error('latitude and longitude are required.', status=400)

        if not settings.GOOGLE_MAPS_API_KEY:
            return success(data={
                'formatted': f'Near {lat:.3f}, {lng:.3f}',
                'city': None, 'state': None, 'country': None,
            }, message='Google Maps API key not configured — returning coordinates only.')

        try:
            resp = requests.get(
                'https://maps.googleapis.com/maps/api/geocode/json',
                params={'latlng': f'{lat},{lng}', 'key': settings.GOOGLE_MAPS_API_KEY},
                timeout=5,
            )
            resp.raise_for_status()
            results = resp.json().get('results', [])
        except requests.RequestException:
            return success(data={'formatted': f'Near {lat:.3f}, {lng:.3f}', 'city': None, 'state': None, 'country': None},
                            message='Geocoding service unavailable — returning coordinates only.')

        if not results:
            return success(data={'formatted': f'Near {lat:.3f}, {lng:.3f}', 'city': None, 'state': None, 'country': None})

        top = results[0]
        components = {c['types'][0]: c['long_name'] for c in top.get('address_components', []) if c.get('types')}
        return success(data={
            'formatted': top.get('formatted_address'),
            'city': components.get('locality'),
            'state': components.get('administrative_area_level_1'),
            'country': components.get('country'),
        })
