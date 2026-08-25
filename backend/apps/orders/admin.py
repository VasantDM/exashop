from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('product_name', 'product_sku', 'unit_price', 'quantity', 'total_price')
    readonly_fields = ('product_name', 'product_sku', 'unit_price', 'quantity', 'total_price')


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    fields = ('status', 'message', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'user',
        'status',
        'payment_status',
        'payment_method',
        'grand_total',
        'created_at',
    )
    list_filter = ('status', 'payment_status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'user__email', 'tracking_number')
    readonly_fields = ('order_number', 'subtotal', 'discount_amount', 'grand_total', 'created_at', 'updated_at')
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    ordering = ('-created_at',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_name', 'product_sku', 'quantity', 'unit_price', 'total_price')
    search_fields = ('order__order_number', 'product_name', 'product_sku')


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'status', 'message', 'created_at')
    search_fields = ('order__order_number', 'message')
