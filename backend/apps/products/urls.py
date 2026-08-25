from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    BrandListView,
    BrandDetailView,
    FeaturedProductsView,
)

app_name = 'products'

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('featured/', FeaturedProductsView.as_view(), name='product-featured'),
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('brands/<str:slug>/', BrandDetailView.as_view(), name='brand-detail'),
    path('<str:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
