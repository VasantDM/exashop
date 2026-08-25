from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.products.models import Product, Brand
from apps.categories.models import Category
from apps.cart.models import Cart, CartItem, WishlistItem

User = get_user_model()


class CartAndShoppingTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='cartuser@shopigo.com',
            username='cartuser',
            password='Password123!',
            role='customer'
        )

        self.category = Category.objects.create(
            name='Audio',
            slug='audio'
        )

        self.product_in_stock = Product.objects.create(
            name='Wireless Headphones Pro',
            slug='wireless-headphones-pro',
            sku='AUD-WHP-01',
            price=200.00,
            discount_price=150.00,
            stock=5,
            is_available=True,
            category=self.category,
            description='Test headphones'
        )

        self.product_out_of_stock = Product.objects.create(
            name='Limited Edition Vintage Mic',
            slug='vintage-mic',
            sku='AUD-MIC-99',
            price=500.00,
            stock=0,
            is_available=True,
            category=self.category,
            description='Vintage studio microphone'
        )

    def test_get_empty_cart(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/cart/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_items'], 0)
        self.assertEqual(response.data['final_total'], 0)

    def test_add_to_cart_success(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product_id': self.product_in_stock.id,
            'quantity': 2
        }
        response = self.client.post('/api/v1/cart/items/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['cart']['total_items'], 2)
        # Unit price is discount_price 150.00 -> 2 * 150 = 300.00
        self.assertEqual(float(response.data['cart']['final_total']), 300.00)
        # Original price 200.00 -> subtotal = 400.00, discount_total = 100.00
        self.assertEqual(float(response.data['cart']['subtotal']), 400.00)
        self.assertEqual(float(response.data['cart']['discount_total']), 100.00)

    def test_add_to_cart_out_of_stock_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product_id': self.product_out_of_stock.id,
            'quantity': 1
        }
        response = self.client.post('/api/v1/cart/items/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_to_cart_exceeds_stock_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product_id': self.product_in_stock.id,
            'quantity': 10  # Stock is only 5
        }
        response = self.client.post('/api/v1/cart/items/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_cart_item_quantity(self):
        self.client.force_authenticate(user=self.user)
        # Add 1 item
        add_res = self.client.post('/api/v1/cart/items/', {'product_id': self.product_in_stock.id, 'quantity': 1}, format='json')
        cart_item_id = add_res.data['cart']['items'][0]['id']

        # Update to 4 items (valid: stock is 5)
        update_res = self.client.patch(f'/api/v1/cart/items/{cart_item_id}/', {'quantity': 4}, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['cart']['total_items'], 4)

        # Update to 6 items (invalid: stock is 5)
        invalid_res = self.client.patch(f'/api/v1/cart/items/{cart_item_id}/', {'quantity': 6}, format='json')
        self.assertEqual(invalid_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_cart_item(self):
        self.client.force_authenticate(user=self.user)
        add_res = self.client.post('/api/v1/cart/items/', {'product_id': self.product_in_stock.id, 'quantity': 2}, format='json')
        cart_item_id = add_res.data['cart']['items'][0]['id']

        del_res = self.client.delete(f'/api/v1/cart/items/{cart_item_id}/remove/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertEqual(del_res.data['cart']['total_items'], 0)

    def test_clear_cart(self):
        self.client.force_authenticate(user=self.user)
        self.client.post('/api/v1/cart/items/', {'product_id': self.product_in_stock.id, 'quantity': 2}, format='json')

        clear_res = self.client.delete('/api/v1/cart/clear/')
        self.assertEqual(clear_res.status_code, status.HTTP_200_OK)
        self.assertEqual(clear_res.data['cart']['total_items'], 0)

    def test_wishlist_toggle_and_list(self):
        self.client.force_authenticate(user=self.user)

        # 1. Add to wishlist
        toggle_res1 = self.client.post('/api/v1/cart/wishlist/', {'product_id': self.product_in_stock.id}, format='json')
        self.assertEqual(toggle_res1.status_code, status.HTTP_201_CREATED)
        self.assertTrue(toggle_res1.data['in_wishlist'])

        # 2. List wishlist items
        list_res = self.client.get('/api/v1/cart/wishlist/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)
        self.assertEqual(list_res.data[0]['product']['id'], self.product_in_stock.id)

        # 3. Toggle again -> removes from wishlist
        toggle_res2 = self.client.post('/api/v1/cart/wishlist/', {'product_id': self.product_in_stock.id}, format='json')
        self.assertEqual(toggle_res2.status_code, status.HTTP_200_OK)
        self.assertFalse(toggle_res2.data['in_wishlist'])
