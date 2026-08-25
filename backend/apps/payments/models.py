import uuid
from django.db import models
from django.conf import settings
from apps.orders.models import Order


class PaymentTransaction(models.Model):
    """Payment transaction ledger recording all gateway intents and verification results."""

    GATEWAY_CHOICES = (
        ('razorpay', 'Razorpay (UPI, Cards, Netbanking)'),
        ('stripe', 'Stripe Secure Checkout'),
        ('card_instant', 'Instant Credit / Debit Card'),
        ('cod', 'Cash on Delivery (COD)'),
    )

    STATUS_CHOICES = (
        ('initiated', 'Initiated / Intent Created'),
        ('pending', 'Pending Verification'),
        ('success', 'Payment Successful / Captured'),
        ('failed', 'Payment Failed'),
        ('refunded', 'Payment Refunded'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text="Order associated with this payment transaction."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    gateway = models.CharField(max_length=30, choices=GATEWAY_CHOICES, default='razorpay')
    
    # Gateway Identifiers
    gateway_order_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    gateway_payment_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    gateway_signature = models.CharField(max_length=500, blank=True, null=True)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='initiated', db_index=True)

    error_message = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True, help_text="Raw gateway response payload.")

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.gateway.upper()} - {self.order.order_number} ({self.status}) - ₹{self.amount}"


class RefundTransaction(models.Model):
    """Refund transaction record for returned or cancelled orders."""

    STATUS_CHOICES = (
        ('pending', 'Refund Pending'),
        ('success', 'Refund Processed Successfully'),
        ('failed', 'Refund Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        PaymentTransaction,
        on_delete=models.CASCADE,
        related_name='refunds'
    )
    refund_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Refund Transaction'
        verbose_name_plural = 'Refund Transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund {self.refund_id} for {self.payment.order.order_number} - ₹{self.amount}"
