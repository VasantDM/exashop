from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.products.models import Product, ProductVariant, Brand
from apps.categories.models import Category
from apps.orders.models import Order, OrderItem
from apps.users.models import Address

User = get_user_model()


class AdminDashboardAPITests(TestCase):
    """Unit tests for Phase 7 Admin Management Suite."""

    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_superuser(
            email='admin@aurastore.com',
            username='adminuser',
            password='AdminPassword123!'
        )

        # Normal customer
        self.customer = User.objects.create_user(
            email='customer@example.com',
            username='regularuser',
            password='CustomerPassword123!',
            first_name='John',
            last_name='Doe'
        )

        # Sample category & brand
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.brand = Brand.objects.create(name='AuraTech', slug='auratech')

        # Sample product with variants
        self.product = Product.objects.create(
            name='Test Smartwatch',
            slug='test-smartwatch',
            sku='TST-WAT-001',
            price=1999.00,
            discount_price=1799.00,
            category=self.category,
            brand=self.brand,
            stock=10,
            is_available=True
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku='TST-WAT-BLK-M',
            color_name='Black',
            color_code='#000000',
            size='M',
            stock=4,  # Low stock
            is_active=True
        )

        # Sample address & order
        self.address = Address.objects.create(
            user=self.customer,
            full_name='John Doe',
            phone_number='9876543210',
            street_address='123 Tech Lane',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560001',
            is_default=True
        )

        self.order = Order.objects.create(
            user=self.customer,
            shipping_address={
                'full_name': 'John Doe',
                'street_address': '123 Tech Lane',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'postal_code': '560001',
            },
            status='pending',
            payment_status='paid',
            payment_method='razorpay',
            subtotal=1799.00,
            grand_total=1799.00
        )

        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            variant=self.variant,
            product_name=self.product.name,
            product_sku=self.variant.sku,
            unit_price=1799.00,
            quantity=1,
            total_price=1799.00
        )

    def test_customer_cannot_access_admin_dashboard(self):
        """Customers should receive 403 Forbidden on admin routes."""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/v1/admin/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_dashboard_overview_kpis(self):
        """Admin can view dashboard overview with revenue and low stock radar."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/admin/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('kpis', response.data)
        self.assertEqual(float(response.data['kpis']['total_revenue']), 1799.00)
        self.assertEqual(response.data['kpis']['total_orders'], 1)
        self.assertGreaterEqual(len(response.data['recent_orders']), 1)
        self.assertGreaterEqual(len(response.data['low_stock_items']), 1)

    def test_admin_create_product_with_variants(self):
        """Admin can create a new product with initial variants."""
        self.client.force_authenticate(user=self.admin)
        payload = {
            'name': 'Admin Canvas Jacket',
            'sku': 'ADM-JKT-001',
            'short_description': 'Durable canvas jacket with corduroy collar.',
            'description': 'Heavyweight 100% cotton canvas with dual chest pockets.',
            'price': '3499.00',
            'discount_price': '2999.00',
            'category': self.category.id,
            'brand': self.brand.id,
            'stock': 20,
            'is_available': True,
            'initial_image_url': 'https://images.unsplash.com/photo-1544441893-675973e31985',
            'initial_variants': [
                {'color_name': 'Khaki', 'color_code': '#c2a649', 'size': 'M', 'stock': 10},
                {'color_name': 'Khaki', 'color_code': '#c2a649', 'size': 'L', 'stock': 10},
            ]
        }
        response = self.client.post('/api/v1/admin/products/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Admin Canvas Jacket')
        self.assertEqual(response.data['variants_count'], 2)

    def test_admin_update_order_status_and_tracking(self):
        """Admin can update order lifecycle status and assign tracking number."""
        self.client.force_authenticate(user=self.admin)
        payload = {
            'status': 'shipped',
            'tracking_number': 'BLUEDART-98471203',
            'message': 'Package picked up by BlueDart Express.'
        }
        response = self.client.patch(f'/api/v1/admin/orders/{self.order.order_number}/status/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['order']['status'], 'shipped')
        self.assertEqual(response.data['order']['tracking_number'], 'BLUEDART-98471203')

    def test_admin_customer_directory_and_toggle_active(self):
        """Admin can list customers and toggle their active state."""
        self.client.force_authenticate(user=self.admin)
        list_res = self.client.get('/api/v1/admin/customers/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.data['results'] if 'results' in list_res.data else list_res.data), 1)

        toggle_res = self.client.patch(f'/api/v1/admin/customers/{self.customer.id}/toggle-active/')
        self.assertEqual(toggle_res.status_code, status.HTTP_200_OK)
        self.assertEqual(toggle_res.data['is_active'], False)

    def test_admin_inventory_quick_update(self):
        """Admin can quick adjust stock for a variant or product."""
        self.client.force_authenticate(user=self.admin)
        payload = {
            'id': self.variant.id,
            'is_variant': True,
            'delta': 10
        }
        response = self.client.post('/api/v1/admin/inventory/update-stock/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['stock'], 14)  # 4 + 10 = 14
