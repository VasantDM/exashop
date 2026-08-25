from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.categories.models import Category
from apps.cart.models import Cart, CartItem
from apps.users.models import Address
from apps.orders.models import Order

User = get_user_model()


class OrderEngineAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='shopper@shopigo.com',
            username='shopper',
            password='Password123!',
            role='customer'
        )

        self.admin = User.objects.create_user(
            email='admin@shopigo.com',
            username='adminuser',
            password='Password123!',
            role='admin'
        )

        self.category = Category.objects.create(name='Electronics', slug='electronics')

        self.product = Product.objects.create(
            name='Ultra Gaming Display 34',
            slug='ultra-gaming-display-34',
            sku='ELC-DISP-01',
            price=1000.00,
            discount_price=850.00,
            stock=10,
            is_available=True,
            category=self.category,
            description='Curved gaming monitor'
        )

        self.address = Address.objects.create(
            user=self.user,
            full_name='John Doe',
            phone_number='+1 555-1234',
            street_address='123 Innovation Way',
            city='San Francisco',
            state='CA',
            postal_code='94105',
            country='United States',
            is_default=True
        )

    def test_create_order_success_and_deduct_stock(self):
        self.client.force_authenticate(user=self.user)

        # 1. Setup cart with 2 items
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        initial_stock = self.product.stock

        # 2. Place Order
        payload = {
            'address_id': self.address.id,
            'payment_method': 'card',
            'notes': 'Please ring the doorbell upon arrival.'
        }
        response = self.client.post('/api/v1/orders/create/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order', response.data)

        order_data = response.data['order']
        self.assertEqual(order_data['total_items'], 2)
        # Unit discount price = 850.00 * 2 = 1700.00 (Free shipping >= 100)
        self.assertEqual(float(order_data['grand_total']), 1700.00)

        # 3. Verify Stock was atomically deducted from 10 to 8
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock - 2)

        # 4. Verify Cart was cleared
        cart.refresh_from_db()
        self.assertEqual(cart.items.count(), 0)

        # 5. Verify Timeline Log exists
        self.assertGreaterEqual(len(order_data['timeline']), 1)
        self.assertEqual(order_data['timeline'][0]['status'], 'pending')

    def test_create_order_empty_cart_fails(self):
        self.client.force_authenticate(user=self.user)
        # Empty cart
        payload = {'address_id': self.address.id, 'payment_method': 'card'}
        response = self.client.post('/api/v1/orders/create/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_orders_list_and_details(self):
        self.client.force_authenticate(user=self.user)
        # Setup cart and place order
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        place_res = self.client.post('/api/v1/orders/create/', {'address_id': self.address.id}, format='json')
        order_number = place_res.data['order']['order_number']

        # Get List
        list_res = self.client.get('/api/v1/orders/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)
        self.assertEqual(list_res.data[0]['order_number'], order_number)

        # Get Details
        detail_res = self.client.get(f'/api/v1/orders/{order_number}/')
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data['order_number'], order_number)
        self.assertEqual(len(detail_res.data['items']), 1)
        self.assertEqual(detail_res.data['shipping_address']['city'], 'San Francisco')

    def test_cancel_order_and_refund_stock(self):
        self.client.force_authenticate(user=self.user)
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=3)

        place_res = self.client.post('/api/v1/orders/create/', {'address_id': self.address.id}, format='json')
        order_number = place_res.data['order']['order_number']

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)  # 10 - 3 = 7

        # Cancel Order
        cancel_res = self.client.post(f'/api/v1/orders/{order_number}/cancel/')
        self.assertEqual(cancel_res.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_res.data['order']['status'], 'cancelled')

        # Verify stock was refunded back to 10
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_admin_update_order_status(self):
        # 1. Customer places order
        self.client.force_authenticate(user=self.user)
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        place_res = self.client.post('/api/v1/orders/create/', {'address_id': self.address.id}, format='json')
        order_number = place_res.data['order']['order_number']

        # 2. Admin updates status to shipped with tracking number
        self.client.force_authenticate(user=self.admin)
        update_payload = {
            'status': 'shipped',
            'tracking_number': 'FEDEX-987654321',
            'message': 'Handed over to courier express.'
        }
        update_res = self.client.patch(f'/api/v1/orders/{order_number}/status/', update_payload, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['order']['status'], 'shipped')
        self.assertEqual(update_res.data['order']['tracking_number'], 'FEDEX-987654321')
        self.assertEqual(len(update_res.data['order']['timeline']), 2)
