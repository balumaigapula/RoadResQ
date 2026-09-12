from rest_framework.test import APITestCase

from accounts.models import User
from notifications.services import notify


class NotificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='notifuser@example.com', password='Password123', first_name='N',
            phone='+919876500051', role='CUSTOMER', is_verified=True,
        )
        self.other = User.objects.create_user(
            email='other-notif@example.com', password='Password123', first_name='O',
            phone='+919876500052', role='CUSTOMER', is_verified=True,
        )
        login = self.client.post('/api/auth/login/', {'email': 'notifuser@example.com', 'password': 'Password123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['data']['access']}")

    def test_user_only_sees_own_notifications(self):
        notify(recipient=self.user, title='Mine', message='m', notification_type='REQUEST_RECEIVED')
        notify(recipient=self.other, title='Not mine', message='m', notification_type='REQUEST_RECEIVED')
        resp = self.client.get('/api/notifications/')
        self.assertEqual(len(resp.data['data']), 1)
        self.assertEqual(resp.data['data'][0]['title'], 'Mine')

    def test_mark_all_as_read(self):
        notify(recipient=self.user, title='A', message='m', notification_type='REQUEST_RECEIVED')
        notify(recipient=self.user, title='B', message='m', notification_type='REQUEST_RECEIVED')
        resp = self.client.post('/api/notifications/read-all/')
        self.assertEqual(resp.status_code, 200)
        list_resp = self.client.get('/api/notifications/')
        self.assertTrue(all(n['is_read'] for n in list_resp.data['data']))
