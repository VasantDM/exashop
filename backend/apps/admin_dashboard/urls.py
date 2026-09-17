from django.urls import path
from .views import (
    AdminDashboardOverviewView,
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminProductVariantCreateView,
    AdminProductVariantDeleteView,
    AdminProductImageCreateView,
    AdminProductImageDeleteView,
    AdminProductImageSetPrimaryView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
    AdminOrderStatusUpdateView,
    AdminCustomerListView,
    AdminCustomerToggleActiveView,
    AdminUserDetailView,
    AdminInventoryListView,
    AdminInventoryQuickUpdateView,
    AdminNotificationsView,
)

urlpatterns = [
    # 1. Executive Dashboard KPI, Analytics & Notifications
    path('dashboard/', AdminDashboardOverviewView.as_view(), name='admin-dashboard'),
    path('notifications/', AdminNotificationsView.as_view(), name='admin-notifications'),

    # 2. Product, Variant & Image Management
    path('products/', AdminProductListCreateView.as_view(), name='admin-product-list-create'),
    path('products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('products/<int:pk>/variants/', AdminProductVariantCreateView.as_view(), name='admin-product-variant-create'),
    path('products/variants/<int:var_pk>/', AdminProductVariantDeleteView.as_view(), name='admin-product-variant-delete'),
    path('products/<int:pk>/images/', AdminProductImageCreateView.as_view(), name='admin-product-image-create'),
    path('products/images/<int:img_pk>/', AdminProductImageDeleteView.as_view(), name='admin-product-image-delete'),
    path('products/images/<int:img_pk>/primary/', AdminProductImageSetPrimaryView.as_view(), name='admin-product-image-set-primary'),

    # 3. Category Management
    path('categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list-create'),
    path('categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),

    # 4. Order Management
    path('orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('orders/<str:order_number>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('orders/<str:order_number>/status/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status-update'),

    # 5. Customer & User Directory, Registration & Account Management
    path('customers/', AdminCustomerListView.as_view(), name='admin-customer-list'),
    path('customers/<int:pk>/', AdminUserDetailView.as_view(), name='admin-customer-detail'),
    path('customers/<int:pk>/toggle-active/', AdminCustomerToggleActiveView.as_view(), name='admin-customer-toggle-active'),
    path('users/', AdminCustomerListView.as_view(), name='admin-user-list-create'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/toggle-active/', AdminCustomerToggleActiveView.as_view(), name='admin-user-toggle-active'),

    # 6. Inventory Radar & Quick Stock Adjuster
    path('inventory/', AdminInventoryListView.as_view(), name='admin-inventory-list'),
    path('inventory/update-stock/', AdminInventoryQuickUpdateView.as_view(), name='admin-inventory-update-stock'),
]
