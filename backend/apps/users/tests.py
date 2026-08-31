from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.users.models import User, Address


class AuthAndUserTests(APITestCase):
    def setUp(self):
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.profile_url = '/api/v1/users/profile/'
        self.change_password_url = '/api/v1/users/change-password/'
        self.addresses_url = '/api/v1/users/addresses/'
        self.admin_users_url = '/api/v1/users/admin/all/'

        # Setup test customer
        self.customer = User.objects.create_user(
            email='testcustomer@shopigo.com',
            username='testcustomer',
            password='Password123!',
            first_name='Test',
            last_name='Customer',
            role='customer'
        )

        # Setup test admin
        self.admin = User.objects.create_user(
            email='testadmin@shopigo.com',
            username='testadmin',
            password='AdminPassword123!',
            first_name='Test',
            last_name='Admin',
            role='admin',
            is_staff=True,
            is_superuser=True
        )

    def test_user_registration_success(self):
        payload = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '1234567890',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'role': 'customer'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_registration_password_mismatch(self):
        payload = {
            'username': 'mismatchuser',
            'email': 'mismatch@example.com',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword123!'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)

    def test_login_with_email(self):
        payload = {
            'email': 'testcustomer@shopigo.com',
            'password': 'Password123!'
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'testcustomer')
        self.assertEqual(response.data['user']['role'], 'customer')

    def test_login_with_username(self):
        payload = {
            'username': 'testcustomer',
            'password': 'Password123!'
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'testcustomer@shopigo.com')

    def test_login_invalid_credentials(self):
        payload = {
            'email': 'testcustomer@shopigo.com',
            'password': 'WrongPassword'
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_profile_authenticated(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testcustomer@shopigo.com')
        self.assertEqual(response.data['role'], 'customer')

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            'first_name': 'UpdatedFirst',
            'last_name': 'UpdatedLast',
            'phone_number': '+1 987 654 3210'
        }
        response = self.client.patch(self.profile_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'UpdatedFirst')
        self.assertEqual(response.data['last_name'], 'UpdatedLast')
        self.assertEqual(response.data['phone_number'], '+1 987 654 3210')

    def test_change_password(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            'old_password': 'Password123!',
            'new_password': 'BrandNewPassword123!',
            'confirm_new_password': 'BrandNewPassword123!'
        }
        response = self.client.post(self.change_password_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify old password no longer works
        self.client.force_authenticate(user=None)
        login_res = self.client.post(self.login_url, {'email': 'testcustomer@shopigo.com', 'password': 'BrandNewPassword123!'}, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_address_management(self):
        self.client.force_authenticate(user=self.customer)
        address_payload = {
            'address_type': 'shipping',
            'full_name': 'Test Recipient',
            'phone_number': '+1 234 567 8900',
            'street_address': '100 Tech Way',
            'city': 'San Francisco',
            'state': 'CA',
            'postal_code': '94105',
            'country': 'United States',
            'is_default': True
        }
        response = self.client.post(self.addresses_url, address_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        address_id = response.data['id']

        # Get address list
        list_res = self.client.get(self.addresses_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get('results', list_res.data)
        self.assertEqual(len(results), 1)

        # Delete address
        del_res = self.client.delete(f"{self.addresses_url}{address_id}/")
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

    def test_role_permissions_customer_denied_admin_endpoint(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(self.admin_users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_role_permissions_admin_allowed(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.admin_users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_public_registration_forces_customer_role(self):
        """Public storefront registration should always create customer accounts, even if role='admin' is passed."""
        payload = {
            'username': 'attempt_admin',
            'email': 'attempt_admin@example.com',
            'first_name': 'Hacker',
            'last_name': 'Attempt',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'role': 'admin'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='attempt_admin@example.com')
        self.assertEqual(user.role, 'customer')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_admin_creates_user_with_role_admin_and_staff(self):
        """Admin panel registration should allow assigning admin or staff roles."""
        self.client.force_authenticate(user=self.admin)
        admin_create_url = '/api/v1/admin/customers/'
        
        # 1. Create an admin
        payload_admin = {
            'username': 'created_admin',
            'email': 'created_admin@shopigo.com',
            'first_name': 'Created',
            'last_name': 'Admin',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'role': 'admin',
        }
        res_admin = self.client.post(admin_create_url, payload_admin, format='json')
        self.assertEqual(res_admin.status_code, status.HTTP_201_CREATED)
        new_admin = User.objects.get(email='created_admin@shopigo.com')
        self.assertEqual(new_admin.role, 'admin')
        self.assertTrue(new_admin.is_staff)

        # 2. Create a staff
        payload_staff = {
            'username': 'created_staff',
            'email': 'created_staff@shopigo.com',
            'first_name': 'Created',
            'last_name': 'Staff',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'role': 'staff',
        }
        res_staff = self.client.post(admin_create_url, payload_staff, format='json')
        self.assertEqual(res_staff.status_code, status.HTTP_201_CREATED)
        new_staff = User.objects.get(email='created_staff@shopigo.com')
        self.assertEqual(new_staff.role, 'staff')
        self.assertTrue(new_staff.is_staff)

    def test_admin_role_filtering_and_stats(self):
        """Verify role-based filtering and aggregated stats."""
        self.client.force_authenticate(user=self.admin)
        admin_list_url = '/api/v1/admin/customers/'

        # Filter by admin
        res_admin = self.client.get(f"{admin_list_url}?role=admin")
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        results_admin = res_admin.data.get('results', res_admin.data)
        for u in results_admin:
            self.assertEqual(u['role'], 'admin')

        # Filter by customer
        res_cust = self.client.get(f"{admin_list_url}?role=customer")
        self.assertEqual(res_cust.status_code, status.HTTP_200_OK)
        results_cust = res_cust.data.get('results', res_cust.data)
        for u in results_cust:
            self.assertEqual(u['role'], 'customer')

        # Default all has stats
        res_all = self.client.get(f"{admin_list_url}?role=all")
        self.assertEqual(res_all.status_code, status.HTTP_200_OK)
        self.assertIn('stats', res_all.data)
        self.assertGreaterEqual(res_all.data['stats']['total'], 2)

    def test_admin_soft_delete_user(self):
        """Deleting a user should perform soft delete: set is_active=False without deleting the SQL row."""
        self.client.force_authenticate(user=self.admin)
        delete_url = f"/api/v1/admin/users/{self.customer.id}/"
        
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertFalse(response.data['is_active'])

        # Verify user still exists in database and has is_active=False
        user_in_db = User.objects.filter(id=self.customer.id).first()
        self.assertIsNotNone(user_in_db, "User must NOT be permanently removed from database")
        self.assertFalse(user_in_db.is_active, "User is_active flag must be False")
