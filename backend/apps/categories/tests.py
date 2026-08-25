from rest_framework.test import APITestCase
from rest_framework import status
from .models import Category


class CategoryAPITests(APITestCase):
    def setUp(self):
        self.cat1 = Category.objects.create(
            name='Test Electronics',
            slug='test-electronics',
            description='Electronic items description'
        )
        self.subcat = Category.objects.create(
            name='Test Smart Gadgets',
            slug='test-smart-gadgets',
            parent=self.cat1,
            description='Subcategory description'
        )

    def test_category_list(self):
        response = self.client.get('/api/v1/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only list top-level category by default
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['slug'], 'test-electronics')
        self.assertEqual(len(results[0]['subcategories']), 1)

    def test_category_detail(self):
        response = self.client.get(f'/api/v1/categories/{self.cat1.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Electronics')
