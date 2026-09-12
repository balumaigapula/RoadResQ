from unittest.mock import patch

from django.urls import reverse
from rest_framework.test import APITestCase

from accounts.models import OTPVerification, User


class RegistrationAndOTPTests(APITestCase):
    def test_register_creates_unverified_user_and_otp(self):
        resp = self.client.post(reverse('register'), {
            'first_name': 'Test', 'last_name': 'User', 'email': 'test@example.com',
            'phone': '+919876543299', 'password': 'RoadResq#Secure99', 'confirm_password': 'RoadResq#Secure99',
            'role': 'CUSTOMER',
        })
        self.assertEqual(resp.status_code, 201)
        user = User.objects.get(email='test@example.com')
        self.assertFalse(user.is_verified)
        self.assertTrue(OTPVerification.objects.filter(user=user, purpose='REGISTRATION').exists())

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(email='dup@example.com', password='x', first_name='A', phone='+919876543298', role='CUSTOMER')
        resp = self.client.post(reverse('register'), {
            'first_name': 'B', 'email': 'dup@example.com', 'phone': '+919876543297',
            'password': 'RoadResq#Secure99', 'confirm_password': 'RoadResq#Secure99',
        })
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data['success'])

    def test_register_rejects_mismatched_passwords(self):
        resp = self.client.post(reverse('register'), {
            'first_name': 'B', 'email': 'mismatch@example.com', 'phone': '+919876543296',
            'password': 'RoadResq#Secure99', 'confirm_password': 'Different123',
        })
        self.assertEqual(resp.status_code, 400)

    @patch('accounts.otp.generate_otp', return_value='123456')
    def test_verify_otp_success_activates_account(self, _mock):
        self.client.post(reverse('register'), {
            'first_name': 'Test', 'email': 'verify@example.com', 'phone': '+919876543295',
            'password': 'RoadResq#Secure99', 'confirm_password': 'RoadResq#Secure99',
        })
        resp = self.client.post(reverse('verify-otp'), {'email': 'verify@example.com', 'otp': '123456'})
        self.assertEqual(resp.status_code, 200)
        user = User.objects.get(email='verify@example.com')
        self.assertTrue(user.is_verified)

    @patch('accounts.otp.generate_otp', return_value='123456')
    def test_verify_otp_wrong_code_increments_attempts(self, _mock):
        self.client.post(reverse('register'), {
            'first_name': 'Test', 'email': 'wrongotp@example.com', 'phone': '+919876543294',
            'password': 'RoadResq#Secure99', 'confirm_password': 'RoadResq#Secure99',
        })
        resp = self.client.post(reverse('verify-otp'), {'email': 'wrongotp@example.com', 'otp': '000000'})
        self.assertEqual(resp.status_code, 400)
        user = User.objects.get(email='wrongotp@example.com')
        self.assertFalse(user.is_verified)
        record = OTPVerification.objects.filter(user=user).latest('created_at')
        self.assertEqual(record.attempts, 1)

    @patch('accounts.otp.generate_otp', return_value='123456')
    def test_otp_locks_after_max_attempts(self, _mock):
        self.client.post(reverse('register'), {
            'first_name': 'Test', 'email': 'locked@example.com', 'phone': '+919876543293',
            'password': 'RoadResq#Secure99', 'confirm_password': 'RoadResq#Secure99',
        })
        for _ in range(5):
            self.client.post(reverse('verify-otp'), {'email': 'locked@example.com', 'otp': '000000'})
        resp = self.client.post(reverse('verify-otp'), {'email': 'locked@example.com', 'otp': '123456'})
        self.assertEqual(resp.status_code, 429)

    def test_expired_otp_is_rejected(self):
        user = User.objects.create_user(email='expired@example.com', password='x', first_name='A', phone='+919876543292', role='CUSTOMER')
        record = OTPVerification.create_for(user, OTPVerification.Purpose.REGISTRATION, '111111')
        record.expires_at = record.created_at
        record.save()
        resp = self.client.post(reverse('verify-otp'), {'email': 'expired@example.com', 'otp': '111111'})
        self.assertEqual(resp.status_code, 400)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='login@example.com', password='RoadResq#Secure99', first_name='Login',
            phone='+919876543291', role='CUSTOMER', is_verified=True,
        )

    def test_login_success_returns_tokens_and_user(self):
        resp = self.client.post(reverse('login'), {'email': 'login@example.com', 'password': 'RoadResq#Secure99'})
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data['data'])
        self.assertIn('refresh', resp.data['data'])
        self.assertEqual(resp.data['data']['user']['email'], 'login@example.com')

    def test_login_fails_for_unverified_user(self):
        self.user.is_verified = False
        self.user.save()
        resp = self.client.post(reverse('login'), {'email': 'login@example.com', 'password': 'RoadResq#Secure99'})
        self.assertEqual(resp.status_code, 403)

    def test_login_fails_for_wrong_password(self):
        resp = self.client.post(reverse('login'), {'email': 'login@example.com', 'password': 'WrongPass'})
        self.assertEqual(resp.status_code, 401)

    def test_me_requires_authentication(self):
        resp = self.client.get(reverse('me'))
        self.assertEqual(resp.status_code, 401)

    def test_me_returns_current_user_when_authenticated(self):
        login_resp = self.client.post(reverse('login'), {'email': 'login@example.com', 'password': 'RoadResq#Secure99'})
        token = login_resp.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.get(reverse('me'))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['data']['email'], 'login@example.com')
