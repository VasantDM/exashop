from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from decimal import Decimal
from apps.products.models import Product
from apps.categories.models import Category
from apps.orders.models import Order, OrderItem
from apps.payments.models import PaymentTransaction

User = get_user_model()


class PaymentEngineAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='shopper_pay@shopigo.com',
            username='shopperpay',
            password='Password123!',
            role='customer'
        )

        self.category = Category.objects.create(name='Gadgets', slug='gadgets')
        self.product = Product.objects.create(
            name='Noise Cancelling Headphones',
            slug='noise-cancelling-headphones',
            sku='AUD-NOISE-01',
            price=2999.00,
            stock=15,
            is_available=True,
            category=self.category,
        )

        self.order = Order.objects.create(
            user=self.user,
            shipping_address={
                'full_name': 'Alex Taylor',
                'phone_number': '+91 9876543210',
                'street_address': '101 Cyber City',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'postal_code': '560001',
                'country': 'India',
            },
            payment_method='razorpay',
            payment_status='pending',
            status='pending',
            subtotal=Decimal('2999.00'),
            discount_amount=Decimal('0.00'),
            shipping_fee=Decimal('0.00'),
            tax_amount=Decimal('0.00'),
            grand_total=Decimal('2999.00')
        )

        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            product_sku=self.product.sku,
            unit_price=Decimal('2999.00'),
            quantity=1,
            total_price=Decimal('2999.00')
        )

    def test_create_payment_intent_success(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'order_number': self.order.order_number,
            'gateway': 'razorpay'
        }
        res = self.client.post('/api/v1/payments/create-intent/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('gateway_order_id', res.data)
        self.assertIn('key_id', res.data)
        self.assertEqual(res.data['amount_in_paise'], 299900)
        self.assertEqual(res.data['currency'], 'INR')

        # Verify transaction record was created
        txn = PaymentTransaction.objects.filter(order=self.order).first()
        self.assertIsNotNone(txn)
        self.assertEqual(txn.status, 'pending')

    def test_verify_payment_success_and_update_order(self):
        self.client.force_authenticate(user=self.user)

        # 1. Create Intent
        intent_res = self.client.post('/api/v1/payments/create-intent/', {
            'order_number': self.order.order_number,
            'gateway': 'razorpay'
        }, format='json')
        gateway_order_id = intent_res.data['gateway_order_id']

        # 2. Verify with valid test signature
        verify_payload = {
            'order_number': self.order.order_number,
            'gateway': 'razorpay',
            'gateway_order_id': gateway_order_id,
            'gateway_payment_id': 'pay_test_987654321',
            'gateway_signature': 'test_valid_signature'
        }
        verify_res = self.client.post('/api/v1/payments/verify/', verify_payload, format='json')
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_res.data['payment_status'], 'paid')
        self.assertEqual(verify_res.data['order_status'], 'processing')

        # 3. Verify database state
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, 'paid')
        self.assertEqual(self.order.status, 'processing')

        txn = PaymentTransaction.objects.get(order=self.order)
        self.assertEqual(txn.status, 'success')
        self.assertEqual(txn.gateway_payment_id, 'pay_test_987654321')

    def test_verify_payment_invalid_signature_fails(self):
        self.client.force_authenticate(user=self.user)

        verify_payload = {
            'order_number': self.order.order_number,
            'gateway': 'razorpay',
            'gateway_order_id': 'order_fake_123',
            'gateway_payment_id': 'pay_fake_456',
            'gateway_signature': 'invalid_forged_signature'
        }
        verify_res = self.client.post('/api/v1/payments/verify/', verify_payload, format='json')
        self.assertEqual(verify_res.status_code, status.HTTP_400_BAD_REQUEST)

        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, 'failed')

    def test_get_order_payment_history(self):
        self.client.force_authenticate(user=self.user)
        PaymentTransaction.objects.create(
            order=self.order,
            user=self.user,
            gateway='razorpay',
            gateway_order_id='order_hist_123',
            gateway_payment_id='pay_hist_456',
            amount=Decimal('2999.00'),
            currency='INR',
            status='success'
        )

        res = self.client.get(f'/api/v1/payments/{self.order.order_number}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['order_number'], self.order.order_number)
        self.assertEqual(res.data[0]['status'], 'success')
