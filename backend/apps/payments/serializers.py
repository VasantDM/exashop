from rest_framework import serializers
from .models import PaymentTransaction, RefundTransaction
from apps.orders.models import Order


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Payment transaction serializer providing invoice receipt details."""

    order_number = serializers.CharField(source='order.order_number', read_only=True)
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = PaymentTransaction
        fields = (
            'id',
            'order_number',
            'gateway',
            'gateway_display',
            'gateway_order_id',
            'gateway_payment_id',
            'amount',
            'currency',
            'status',
            'status_display',
            'error_message',
            'metadata',
            'created_at',
            'formatted_date',
        )

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')


class PaymentIntentCreateSerializer(serializers.Serializer):
    """Serializer for creating a payment gateway intent for an order."""

    order_number = serializers.CharField(required=True)
    gateway = serializers.ChoiceField(
        choices=['razorpay', 'stripe', 'card_instant', 'cod'],
        default='razorpay'
    )

    def validate_order_number(self, value):
        user = self.context['request'].user
        order = Order.objects.filter(order_number=value, user=user).first()
        if not order:
            raise serializers.ValidationError("Order not found or access denied.")
        if order.payment_status == 'paid':
            raise serializers.ValidationError("This order has already been paid for.")
        if order.status == 'cancelled':
            raise serializers.ValidationError("Cannot process payment for a cancelled order.")
        return value


class PaymentVerifySerializer(serializers.Serializer):
    """Serializer for validating payment gateway signatures and webhooks."""

    order_number = serializers.CharField(required=True)
    gateway = serializers.ChoiceField(
        choices=['razorpay', 'stripe', 'card_instant', 'cod'],
        default='razorpay'
    )
    gateway_order_id = serializers.CharField(required=False, allow_blank=True, default='')
    gateway_payment_id = serializers.CharField(required=False, allow_blank=True, default='')
    gateway_signature = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_order_number(self, value):
        user = self.context['request'].user
        order = Order.objects.filter(order_number=value, user=user).first()
        if not order:
            raise serializers.ValidationError("Order not found or access denied.")
        return value


class RefundTransactionSerializer(serializers.ModelSerializer):
    """Serializer for refund transaction tracking."""

    class Meta:
        model = RefundTransaction
        fields = (
            'id',
            'refund_id',
            'amount',
            'reason',
            'status',
            'created_at',
        )
