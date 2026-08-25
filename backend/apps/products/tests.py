from rest_framework.test import APITestCase
from rest_framework import status
from apps.categories.models import Category
from apps.products.models import Brand, Product, ProductImage


class ProductCatalogAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name='Audio',
            slug='audio',
            description='Audio devices'
        )
        self.brand = Brand.objects.create(
            name='Sony',
            slug='sony',
            description='Sony Corporation'
        )
        self.product1 = Product.objects.create(
            name='Sony Noise Canceling Headphones',
            slug='sony-noise-canceling-headphones',
            sku='SNY-100',
            price=299.99,
            discount_price=249.99,
            category=self.category,
            brand=self.brand,
            stock=10,
            is_featured=True,
            is_available=True,
            description='Detailed Sony headphones description'
        )
        self.product2 = Product.objects.create(
            name='Budget Wired Earphones',
            slug='budget-wired-earphones',
            sku='AUD-002',
            price=19.99,
            category=self.category,
            stock=0,  # out of stock
            is_available=True,
            description='Simple wired earphones'
        )
        ProductImage.objects.create(
            product=self.product1,
            image_url='https://example.com/headphones.jpg',
            is_primary=True
        )

    def test_product_list(self):
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 2)

    def test_product_search(self):
        response = self.client.get('/api/v1/products/?search=Headphones')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['sku'], 'SNY-100')

    def test_category_filter(self):
        response = self.client.get('/api/v1/products/?category=audio')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 2)

    def test_brand_filter(self):
        response = self.client.get('/api/v1/products/?brand=sony')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Sony Noise Canceling Headphones')

    def test_price_filter(self):
        response = self.client.get('/api/v1/products/?min_price=200&max_price=300')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['sku'], 'SNY-100')

    def test_in_stock_filter(self):
        response = self.client.get('/api/v1/products/?in_stock=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['sku'], 'SNY-100')

    def test_ordering(self):
        response = self.client.get('/api/v1/products/?ordering=price')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        # Lowest price (19.99) should come first
        self.assertEqual(results[0]['sku'], 'AUD-002')

    def test_product_detail(self):
        response = self.client.get(f'/api/v1/products/{self.product1.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Sony Noise Canceling Headphones')
        self.assertEqual(len(response.data['images']), 1)

    def test_brands_list(self):
        response = self.client.get('/api/v1/products/brands/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['slug'], 'sony')
