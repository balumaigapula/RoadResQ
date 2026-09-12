from decimal import Decimal

from rest_framework.test import APITestCase

from accounts.models import User
from assistance.models import AssistanceRequest, RequestStatus
from assistance import services
from providers.models import ProviderProfile
from vehicles.models import Vehicle


class AssistanceRequestTestBase(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email='cust@example.com', password='Password123', first_name='Cust',
            phone='+919876500031', role='CUSTOMER', is_verified=True,
        )
        self.other_customer = User.objects.create_user(
            email='cust2@example.com', password='Password123', first_name='Cust2',
            phone='+919876500032', role='CUSTOMER', is_verified=True,
        )
        provider_user = User.objects.create_user(
            email='prov@example.com', password='Password123', first_name='Prov',
            phone='+919876500033', role='PROVIDER', is_verified=True,
        )
        self.provider = ProviderProfile.objects.get(user=provider_user)
        self.provider.service_types = ['MECHANIC']
        self.provider.latitude = Decimal('17.4239')
        self.provider.longitude = Decimal('78.4738')
        self.provider.is_online = True
        self.provider.verification_status = ProviderProfile.VerificationStatus.APPROVED
        self.provider.save()

        self.vehicle = Vehicle.objects.create(
            user=self.customer, vehicle_type='Car', vehicle_number='AP05AB1234',
            brand='Maruti Suzuki', model='Swift', fuel_type='Petrol', year=2021,
        )

    def login(self, email, password='Password123'):
        resp = self.client.post('/api/auth/login/', {'email': email, 'password': password})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['data']['access']}")


class CreateRequestTests(AssistanceRequestTestBase):
    def test_customer_can_create_request_for_own_vehicle(self):
        self.login('cust@example.com')
        resp = self.client.post('/api/assistance/requests/', {
            'vehicle_id': self.vehicle.id, 'service_category': 'MECHANIC',
            'latitude': '17.4', 'longitude': '78.4', 'address': 'Test address',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(AssistanceRequest.objects.filter(customer=self.customer).exists())
        self.assertGreater(float(resp.data['data']['amount']), 0)

    def test_customer_cannot_create_request_for_others_vehicle(self):
        self.login('cust2@example.com')
        resp = self.client.post('/api/assistance/requests/', {
            'vehicle_id': self.vehicle.id, 'service_category': 'MECHANIC',
            'latitude': '17.4', 'longitude': '78.4',
        })
        self.assertEqual(resp.status_code, 400)

    def test_backend_computes_total_regardless_of_client_input(self):
        self.login('cust@example.com')
        resp = self.client.post('/api/assistance/requests/', {
            'vehicle_id': self.vehicle.id, 'service_category': 'MECHANIC',
            'latitude': '17.4', 'longitude': '78.4',
            'total_amount': '1',  # Attempted spoof — not an accepted field at all.
        })
        self.assertEqual(resp.status_code, 201)
        self.assertNotEqual(Decimal(str(resp.data['data']['amount'])), Decimal('1'))

    def test_provider_role_cannot_create_customer_request(self):
        self.login('prov@example.com')
        resp = self.client.post('/api/assistance/requests/', {
            'service_category': 'MECHANIC', 'latitude': '17.4', 'longitude': '78.4',
        })
        self.assertEqual(resp.status_code, 403)


class SOSRequestTests(AssistanceRequestTestBase):
    def test_sos_request_is_always_critical_priority(self):
        self.login('cust@example.com')
        resp = self.client.post('/api/assistance/sos/', {
            'emergency_type': 'accident', 'latitude': '17.4', 'longitude': '78.4',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['data']['priority'], 'CRITICAL')
        self.assertTrue(resp.data['data']['is_sos'])


class StatusTransitionTests(AssistanceRequestTestBase):
    def _create_and_assign(self):
        req = services.create_request(
            self.customer, vehicle=self.vehicle, service_category='MECHANIC',
            latitude=Decimal('17.42'), longitude=Decimal('78.47'), provider=self.provider,
        )
        return req

    def test_valid_transition_sequence(self):
        req = self._create_and_assign()
        req = services.accept_request(req, self.provider)
        self.assertEqual(req.status, RequestStatus.ACCEPTED)
        req = services.transition_status(req, RequestStatus.ON_THE_WAY)
        req = services.transition_status(req, RequestStatus.ARRIVED)
        req = services.transition_status(req, RequestStatus.REPAIRING)
        req = services.transition_status(req, RequestStatus.COMPLETED)
        self.assertEqual(req.status, RequestStatus.COMPLETED)
        self.assertIsNotNone(req.completed_at)

    def test_cannot_skip_from_accepted_to_completed(self):
        req = self._create_and_assign()
        req = services.accept_request(req, self.provider)
        with self.assertRaises(services.TransitionError):
            services.transition_status(req, RequestStatus.COMPLETED)

    def test_cannot_transition_completed_backwards(self):
        req = self._create_and_assign()
        req = services.accept_request(req, self.provider)
        for status in [RequestStatus.ON_THE_WAY, RequestStatus.ARRIVED, RequestStatus.REPAIRING, RequestStatus.COMPLETED]:
            req = services.transition_status(req, status)
        with self.assertRaises(services.TransitionError):
            services.transition_status(req, RequestStatus.ACCEPTED)

    def test_cancel_allowed_before_completion(self):
        req = self._create_and_assign()
        req = services.cancel_request(req, actor_role='CUSTOMER')
        self.assertEqual(req.status, RequestStatus.CANCELLED)

    def test_cannot_cancel_completed_request(self):
        req = self._create_and_assign()
        req = services.accept_request(req, self.provider)
        for status in [RequestStatus.ON_THE_WAY, RequestStatus.ARRIVED, RequestStatus.REPAIRING, RequestStatus.COMPLETED]:
            req = services.transition_status(req, status)
        with self.assertRaises(services.TransitionError):
            services.cancel_request(req, actor_role='CUSTOMER')


class ProviderAssignmentGuardTests(AssistanceRequestTestBase):
    def test_cannot_assign_offline_provider(self):
        self.provider.is_online = False
        self.provider.save()
        req = services.create_request(
            self.customer, vehicle=self.vehicle, service_category='MECHANIC',
            latitude=Decimal('17.42'), longitude=Decimal('78.47'),
        )
        with self.assertRaises(services.AssignmentError):
            services.assign_provider(req, self.provider)

    def test_cannot_assign_provider_without_matching_service(self):
        self.provider.service_types = ['BATTERY']
        self.provider.save()
        req = services.create_request(
            self.customer, vehicle=self.vehicle, service_category='MECHANIC',
            latitude=Decimal('17.42'), longitude=Decimal('78.47'),
        )
        with self.assertRaises(services.AssignmentError):
            services.assign_provider(req, self.provider)

    def test_provider_cannot_accept_request_not_assigned_to_them(self):
        other_user = User.objects.create_user(
            email='otherprov@example.com', password='x', first_name='O',
            phone='+919876500034', role='PROVIDER', is_verified=True,
        )
        other_provider = ProviderProfile.objects.get(user=other_user)
        req = services.create_request(
            self.customer, vehicle=self.vehicle, service_category='MECHANIC',
            latitude=Decimal('17.42'), longitude=Decimal('78.47'), provider=self.provider,
        )
        with self.assertRaises(services.AssignmentError):
            services.accept_request(req, other_provider)


class CustomerRequestVisibilityTests(AssistanceRequestTestBase):
    def test_customer_only_sees_own_requests(self):
        services.create_request(
            self.customer, vehicle=self.vehicle, service_category='MECHANIC',
            latitude=Decimal('17.42'), longitude=Decimal('78.47'),
        )
        self.login('cust2@example.com')
        resp = self.client.get('/api/customer/requests/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data['data']), 0)
