from decimal import Decimal

from rest_framework.test import APITestCase

from accounts.models import User
from assistance import services
from assistance.models import RequestStatus
from providers.models import ProviderProfile
from reviews.models import Review
from vehicles.models import Vehicle


class ReviewTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email='revcust@example.com', password='Password123', first_name='C',
            phone='+919876500041', role='CUSTOMER', is_verified=True,
        )
        provider_user = User.objects.create_user(
            email='revprov@example.com', password='Password123', first_name='P',
            phone='+919876500042', role='PROVIDER', is_verified=True,
        )
        self.provider = ProviderProfile.objects.get(user=provider_user)
        self.provider.service_types = ['MECHANIC']
        self.provider.latitude = Decimal('17.42')
        self.provider.longitude = Decimal('78.47')
        self.provider.is_online = True
        self.provider.verification_status = ProviderProfile.VerificationStatus.APPROVED
        self.provider.save()
        self.vehicle = Vehicle.objects.create(
            user=self.customer, vehicle_type='Car', vehicle_number='AP05CD5678',
            brand='Honda', model='City', fuel_type='Petrol', year=2020,
        )
        login = self.client.post('/api/auth/login/', {'email': 'revcust@example.com', 'password': 'Password123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['data']['access']}")

    def _completed_request(self):
        req = services.create_request(
            self.customer, vehicle=self.vehicle, service_category='MECHANIC',
            latitude=Decimal('17.42'), longitude=Decimal('78.47'), provider=self.provider,
        )
        req = services.accept_request(req, self.provider)
        for status in [RequestStatus.ON_THE_WAY, RequestStatus.ARRIVED, RequestStatus.REPAIRING, RequestStatus.COMPLETED]:
            req = services.transition_status(req, status)
        return req

    def test_can_review_completed_request(self):
        req = self._completed_request()
        resp = self.client.post('/api/reviews/', {'request_number': req.request_number, 'rating': 5, 'comment': 'Great!'})
        self.assertEqual(resp.status_code, 201)
        self.provider.refresh_from_db()
        self.assertEqual(self.provider.total_reviews, 1)
        self.assertEqual(float(self.provider.rating), 5.0)

    def test_cannot_review_incomplete_request(self):
        req = services.create_request(
            self.customer, vehicle=self.vehicle, service_category='MECHANIC',
            latitude=Decimal('17.42'), longitude=Decimal('78.47'), provider=self.provider,
        )
        resp = self.client.post('/api/reviews/', {'request_number': req.request_number, 'rating': 5})
        self.assertEqual(resp.status_code, 400)

    def test_cannot_review_same_request_twice(self):
        req = self._completed_request()
        self.client.post('/api/reviews/', {'request_number': req.request_number, 'rating': 4})
        resp = self.client.post('/api/reviews/', {'request_number': req.request_number, 'rating': 5})
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(Review.objects.filter(request=req).count(), 1)

    def test_rating_out_of_range_rejected(self):
        req = self._completed_request()
        resp = self.client.post('/api/reviews/', {'request_number': req.request_number, 'rating': 7})
        self.assertEqual(resp.status_code, 400)
