from django.urls import path
from .views import (
    OrderCreateView,
    OrderListView,
    OrderDetailView,
    OrderCancelView,
    AdminOrderStatusUpdateView,
)

app_name = 'orders'

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_number>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('<str:order_number>/status/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status-update'),
]
