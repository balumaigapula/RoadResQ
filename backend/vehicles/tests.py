from rest_framework.test import APITestCase

from accounts.models import User
from vehicles.models import Vehicle


class VehicleOwnershipTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email='owner@example.com', password='Password123', first_name='Owner',
            phone='+919876500011', role='CUSTOMER', is_verified=True,
        )
        self.other_customer = User.objects.create_user(
            email='other@example.com', password='Password123', first_name='Other',
            phone='+919876500012', role='CUSTOMER', is_verified=True,
        )
        login = self.client.post('/api/auth/login/', {'email': 'owner@example.com', 'password': 'Password123'})
        self.token = login.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_vehicle(self):
        resp = self.client.post('/api/vehicles/', {
            'vehicle_type': 'Car', 'vehicle_number': 'AP05AB1234', 'brand': 'Maruti Suzuki',
            'model': 'Swift', 'fuel_type': 'Petrol', 'year': 2021,
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Vehicle.objects.filter(user=self.customer).count(), 1)

    def test_first_vehicle_is_automatically_primary(self):
        resp = self.client.post('/api/vehicles/', {
            'vehicle_type': 'Car', 'vehicle_number': 'AP05AB1234', 'brand': 'Maruti Suzuki',
            'model': 'Swift', 'fuel_type': 'Petrol', 'year': 2021,
        })
        self.assertTrue(resp.data['data']['is_primary'])

    def test_customer_cannot_see_or_edit_others_vehicles(self):
        other_vehicle = Vehicle.objects.create(
            user=self.other_customer, vehicle_type='Car', vehicle_number='TS01ZZ0001',
            brand='Honda', model='City', fuel_type='Petrol', year=2019,
        )
        list_resp = self.client.get('/api/vehicles/')
        self.assertEqual(len(list_resp.data['data']), 0)

        detail_resp = self.client.get(f'/api/vehicles/{other_vehicle.id}/')
        self.assertEqual(detail_resp.status_code, 404)

        delete_resp = self.client.delete(f'/api/vehicles/{other_vehicle.id}/')
        self.assertEqual(delete_resp.status_code, 404)
        self.assertTrue(Vehicle.objects.filter(id=other_vehicle.id).exists())

    def test_provider_cannot_access_vehicle_endpoints(self):
        provider = User.objects.create_user(
            email='prov@example.com', password='Password123', first_name='Prov',
            phone='+919876500013', role='PROVIDER', is_verified=True,
        )
        login = self.client.post('/api/auth/login/', {'email': 'prov@example.com', 'password': 'Password123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['data']['access']}")
        resp = self.client.get('/api/vehicles/')
        self.assertEqual(resp.status_code, 403)
