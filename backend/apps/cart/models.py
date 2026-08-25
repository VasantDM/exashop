from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.products.models import Product


class Cart(models.Model):
    """Customer Shopping Cart bound to authenticated user or anonymous session."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='cart'
    )
    session_key = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
        ordering = ['-updated_at']

    def __str__(self):
        if self.user:
            return f"Cart of {self.user.email}"
        return f"Guest Cart ({self.session_key})"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        """Total without discounts (original prices)."""
        return sum(item.original_total_price for item in self.items.all())

    @property
    def final_total(self):
        """Total with active product discounts applied."""
        return sum(item.total_price for item in self.items.all())

    @property
    def discount_total(self):
        """Total savings from discounts."""
        savings = self.subtotal - self.final_total
        return max(Decimal('0.00'), savings)


class CartItem(models.Model):
    """Individual line item in a shopping cart with optional variant attributes."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cart_items'
    )
    selected_attributes = models.JSONField(default=dict, blank=True, help_text="e.g. {'color': 'Onyx Black', 'size': 'L'}")
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        unique_together = ('cart', 'product', 'variant')
        ordering = ['-created_at']

    def __str__(self):
        var_info = f" ({self.variant.color_name} / {self.variant.size})" if self.variant else ""
        return f"{self.quantity}x {self.product.name}{var_info}"

    @property
    def unit_price(self):
        if self.variant and self.variant.price_override is not None:
            return Decimal(str(self.variant.price_override))
        return Decimal(str(self.product.current_price))

    @property
    def original_unit_price(self):
        return Decimal(str(self.product.price))

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    @property
    def original_total_price(self):
        return self.original_unit_price * self.quantity

    @property
    def has_discount(self):
        return self.product.has_discount

    @property
    def stock_available(self):
        if self.variant:
            return self.variant.stock
        return self.product.stock

    @property
    def in_stock(self):
        if self.variant:
            return self.variant.stock >= self.quantity and self.variant.is_active and self.product.is_available
        return self.product.stock >= self.quantity and self.product.is_available


class WishlistItem(models.Model):
    """Product saved to customer's wishlist."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Wishlist Item'
        verbose_name_plural = 'Wishlist Items'
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"
