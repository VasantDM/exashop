from django.contrib import admin
from .models import PaymentTransaction, RefundTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'order',
        'user',
        'gateway',
        'amount',
        'currency',
        'status',
        'gateway_payment_id',
        'created_at',
    )
    list_filter = ('gateway', 'status', 'currency', 'created_at')
    search_fields = ('order__order_number', 'gateway_order_id', 'gateway_payment_id', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(RefundTransaction)
class RefundTransactionAdmin(admin.ModelAdmin):
    list_display = ('refund_id', 'payment', 'amount', 'status', 'created_at')
    search_fields = ('refund_id', 'payment__order__order_number')
    list_filter = ('status', 'created_at')
