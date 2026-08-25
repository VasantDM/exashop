from django.contrib import admin
from .models import Cart, CartItem, WishlistItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    fields = ('product', 'quantity', 'unit_price', 'total_price')
    readonly_fields = ('unit_price', 'total_price')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_key', 'total_items', 'final_total', 'updated_at')
    search_fields = ('user__email', 'session_key')
    inlines = [CartItemInline]
    readonly_fields = ('total_items', 'subtotal', 'discount_total', 'final_total')


@admin.register(WishlistItem)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    search_fields = ('user__email', 'product__name')
