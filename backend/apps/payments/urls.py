from django.urls import path
from .views import (
    PaymentIntentCreateView,
    PaymentVerifyView,
    OrderPaymentDetailView,
    PaymentWebhookView,
)

app_name = 'payments'

urlpatterns = [
    path('create-intent/', PaymentIntentCreateView.as_view(), name='payment-create-intent'),
    path('verify/', PaymentVerifyView.as_view(), name='payment-verify'),
    path('webhook/', PaymentWebhookView.as_view(), name='payment-webhook'),
    path('<str:order_number>/', OrderPaymentDetailView.as_view(), name='order-payments'),
]
