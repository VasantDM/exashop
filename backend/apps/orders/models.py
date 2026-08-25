import uuid
from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.products.models import Product


def generate_order_number():
    """Generate unique readable order number like ORD-20260825-A1B2C."""
    from django.utils import timezone
    date_str = timezone.now().strftime('%Y%m%d')
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"ORD-{date_str}-{unique_suffix}"


class Order(models.Model):
    """Customer Order entity containing invoice calculations and address snapshots."""

    STATUS_CHOICES = (
        ('pending', 'Pending Confirmation'),
        ('processing', 'Processing & Packing'),
        ('shipped', 'Shipped / In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Payment Pending'),
        ('paid', 'Paid'),
        ('failed', 'Payment Failed'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('razorpay', 'Razorpay (UPI, QR, Netbanking)'),
        ('card_instant', 'Instant Credit / Debit Card'),
        ('card', 'Credit / Debit Card'),
        ('cod', 'Cash on Delivery (COD)'),
        ('stripe', 'Stripe Secure Checkout'),
        ('paypal', 'PayPal'),
    )

    order_number = models.CharField(
        max_length=64,
        unique=True,
        default=generate_order_number,
        db_index=True,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', db_index=True)
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='card')

    # Immutable Address Snapshot (Preserves order history even if user profile edits address)
    shipping_address = models.JSONField(help_text="Snapshot of shipping address at time of order placement.")
    billing_address = models.JSONField(null=True, blank=True, help_text="Snapshot of billing address.")

    # Financial Breakdown
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, help_text="Subtotal of line items.")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, help_text="Final payable amount.")

    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, help_text="Customer delivery instructions or notes.")

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.user.email} (${self.grand_total})"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def can_cancel(self):
        return self.status in ['pending', 'processing']


class OrderItem(models.Model):
    """Snapshot line item belonging to a placed order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')

    # Snapshot data
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    product_image = models.CharField(max_length=500, blank=True, null=True)
    color_name = models.CharField(max_length=64, blank=True)
    size = models.CharField(max_length=30, blank=True)
    variant_details = models.JSONField(default=dict, blank=True)

    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
        ordering = ['id']

    def __str__(self):
        var_desc = f" ({self.color_name} / {self.size})" if self.color_name or self.size else ""
        return f"{self.quantity}x {self.product_name}{var_desc} ({self.order.order_number})"


class OrderStatusHistory(models.Model):
    """Timeline event log for order lifecycle tracking."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(max_length=30)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Order Status History'
        verbose_name_plural = 'Order Status Histories'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.order.order_number} -> {self.status} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
