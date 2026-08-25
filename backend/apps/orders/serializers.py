from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from apps.users.models import Address


class OrderItemSerializer(serializers.ModelSerializer):
    """Line item serializer with immutable product snapshot and variant details."""

    product_id = serializers.ReadOnlyField(source='product.id')
    product_slug = serializers.ReadOnlyField(source='product.slug')

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'product_id',
            'product_slug',
            'product_name',
            'product_sku',
            'product_image',
            'color_name',
            'size',
            'variant_details',
            'unit_price',
            'quantity',
            'total_price',
            'created_at',
        )


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Timeline entry serializer for tracking status progress."""

    formatted_time = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = ('id', 'status', 'message', 'created_at', 'formatted_time')

    def get_formatted_time(self, obj):
        return obj.created_at.strftime('%b %d, %Y - %I:%M %p')


class OrderListSerializer(serializers.ModelSerializer):
    """Compact Order representation for customer order history list."""

    total_items = serializers.ReadOnlyField()
    items_preview = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'status',
            'status_display',
            'payment_status',
            'payment_status_display',
            'payment_method',
            'grand_total',
            'total_items',
            'items_preview',
            'created_at',
            'formatted_date',
        )

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%B %d, %Y')

    def get_items_preview(self, obj):
        return [
            {
                'name': item.product_name,
                'image': item.product_image,
                'quantity': item.quantity
            }
            for item in obj.items.all()[:4]
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Comprehensive Order invoice view with full itemized breakdown and tracking history."""

    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderStatusHistorySerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    can_cancel = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'status',
            'status_display',
            'payment_status',
            'payment_status_display',
            'payment_method',
            'payment_method_display',
            'shipping_address',
            'billing_address',
            'subtotal',
            'discount_amount',
            'shipping_fee',
            'tax_amount',
            'grand_total',
            'tracking_number',
            'notes',
            'total_items',
            'can_cancel',
            'items',
            'timeline',
            'created_at',
            'formatted_date',
        )

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')


class OrderCreateSerializer(serializers.Serializer):
    """Validation serializer for placing an order from the shopping cart."""

    address_id = serializers.IntegerField(required=False, allow_null=True)
    shipping_address = serializers.DictField(required=False, allow_null=True)
    payment_method = serializers.ChoiceField(
        choices=['razorpay', 'card_instant', 'card', 'cod', 'stripe', 'paypal'],
        default='razorpay'
    )
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    promo_code = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        address_id = attrs.get('address_id')
        shipping_address = attrs.get('shipping_address')

        if not address_id and not shipping_address:
            raise serializers.ValidationError({
                'shipping_address': 'Please select a saved address or provide a new shipping address.'
            })

        user = self.context.get('request').user
        if address_id:
            try:
                addr = Address.objects.get(pk=address_id, user=user)
                # Build address snapshot dictionary
                attrs['resolved_shipping_address'] = {
                    'full_name': addr.full_name,
                    'phone_number': addr.phone_number,
                    'street_address': addr.street_address,
                    'apartment_suite': addr.apartment_suite or '',
                    'city': addr.city,
                    'state': addr.state,
                    'postal_code': addr.postal_code,
                    'country': addr.country,
                }
            except Address.DoesNotExist:
                raise serializers.ValidationError({'address_id': 'Selected address does not exist.'})
        else:
            required_keys = ['full_name', 'phone_number', 'street_address', 'city', 'state', 'postal_code']
            for key in required_keys:
                if not shipping_address.get(key):
                    raise serializers.ValidationError({
                        'shipping_address': f"'{key.replace('_', ' ').title()}' is required in shipping address."
                    })
            attrs['resolved_shipping_address'] = shipping_address

        return attrs
