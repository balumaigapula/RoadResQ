from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APITestCase

from accounts.models import User
from providers.matching import compute_match_score, estimate_eta_minutes, haversine_km
from providers.models import ProviderProfile


class HaversineTests(TestCase):
    def test_same_point_is_zero_distance(self):
        self.assertAlmostEqual(haversine_km(17.4239, 78.4738, 17.4239, 78.4738), 0.0, places=5)

    def test_known_distance_hyderabad_landmarks(self):
        # Charminar to Hitech City, Hyderabad — roughly 12-14km as the crow flies.
        distance = haversine_km(17.3616, 78.4747, 17.4483, 78.3915)
        self.assertGreater(distance, 8)
        self.assertLess(distance, 20)

    def test_eta_increases_with_distance(self):
        self.assertLess(estimate_eta_minutes(2), estimate_eta_minutes(10))


class MatchScoreTests(TestCase):
    def test_closer_available_higher_rated_provider_scores_higher(self):
        good = compute_match_score(distance_km=1.5, rating=Decimal('4.9'), is_available=True, acceptance_rate=Decimal('95'))
        poor = compute_match_score(distance_km=9.0, rating=Decimal('3.5'), is_available=False, acceptance_rate=Decimal('60'))
        self.assertGreater(good, poor)

    def test_score_is_bounded(self):
        score = compute_match_score(distance_km=0, rating=Decimal('5.0'), is_available=True, acceptance_rate=Decimal('100'))
        self.assertLessEqual(score, 99)
        low = compute_match_score(distance_km=100, rating=Decimal('0'), is_available=False, acceptance_rate=Decimal('0'))
        self.assertGreaterEqual(low, 1)


class NearbyProvidersAPITests(APITestCase):
    def setUp(self):
        user = User.objects.create_user(
            email='nearby-provider@example.com', password='x', first_name='P',
            phone='+919876500021', role='PROVIDER', is_verified=True,
        )
        self.provider = ProviderProfile.objects.get(user=user)
        self.provider.business_name = 'Test Mechanic'
        self.provider.service_types = ['MECHANIC']
        self.provider.latitude = Decimal('17.4239')
        self.provider.longitude = Decimal('78.4738')
        self.provider.is_online = True
        self.provider.verification_status = ProviderProfile.VerificationStatus.APPROVED
        self.provider.save()

    def test_unapproved_providers_are_excluded(self):
        self.provider.verification_status = ProviderProfile.VerificationStatus.PENDING
        self.provider.save()
        resp = self.client.get('/api/providers/nearby/', {'latitude': 17.42, 'longitude': 78.47})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data['data']), 0)

    def test_approved_provider_is_returned_with_real_distance(self):
        resp = self.client.get('/api/providers/nearby/', {'latitude': 17.4239, 'longitude': 78.4738, 'service_type': 'MECHANIC'})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data['data']), 1)
        self.assertAlmostEqual(resp.data['data'][0]['distance'], 0.0, places=1)

    def test_missing_coordinates_returns_400(self):
        resp = self.client.get('/api/providers/nearby/')
        self.assertEqual(resp.status_code, 400)
