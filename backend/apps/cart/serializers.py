from rest_framework import serializers
from .models import Cart, CartItem, WishlistItem
from apps.products.models import Product, ProductVariant
from apps.products.serializers import ProductVariantSerializer


class CartItemProductSerializer(serializers.ModelSerializer):
    """Compact Product representation for Cart and Wishlist items."""

    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()
    has_discount = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'sku',
            'price',
            'discount_price',
            'current_price',
            'has_discount',
            'discount_percentage',
            'primary_image',
            'brand_name',
            'category_name',
            'stock',
            'is_available',
        )


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for line items within a shopping cart with variant details."""

    product = CartItemProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    variant_id = serializers.IntegerField(source='variant.id', read_only=True, allow_null=True)
    color_name = serializers.CharField(source='variant.color_name', read_only=True, default='')
    color_code = serializers.CharField(source='variant.color_code', read_only=True, default='')
    size = serializers.CharField(source='variant.size', read_only=True, default='')
    variant_sku = serializers.CharField(source='variant.sku', read_only=True, default='')
    unit_price = serializers.ReadOnlyField()
    original_unit_price = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    original_total_price = serializers.ReadOnlyField()
    has_discount = serializers.ReadOnlyField()
    stock_available = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = (
            'id',
            'product',
            'variant',
            'variant_id',
            'color_name',
            'color_code',
            'size',
            'variant_sku',
            'selected_attributes',
            'quantity',
            'unit_price',
            'original_unit_price',
            'total_price',
            'original_total_price',
            'has_discount',
            'stock_available',
            'in_stock',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class CartSerializer(serializers.ModelSerializer):
    """Comprehensive Shopping Cart serializer with calculated totals."""

    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()
    discount_total = serializers.ReadOnlyField()
    final_total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = (
            'id',
            'items',
            'total_items',
            'subtotal',
            'discount_total',
            'final_total',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class AddToCartSerializer(serializers.Serializer):
    """Validation serializer for adding products & variants to cart."""

    product_id = serializers.IntegerField(required=True)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(required=False, default=1, min_value=1)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(pk=value, is_available=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError('Product does not exist or is currently unavailable.')

        return value

    def validate(self, attrs):
        product_id = attrs.get('product_id')
        variant_id = attrs.get('variant_id')
        quantity = attrs.get('quantity', 1)
        product = Product.objects.get(pk=product_id)

        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(pk=variant_id, product=product, is_active=True)
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError({'variant_id': 'Selected variant does not exist for this product.'})

            if quantity > variant.stock:
                raise serializers.ValidationError({
                    'quantity': f"Requested quantity ({quantity}) exceeds available stock for size {variant.size} ({variant.stock} available)."
                })
        else:
            # If product has variants, select the first active in-stock variant as default for quick-add
            if product.has_variants:
                default_variant = product.variants.filter(is_active=True, stock__gt=0).first()
                if default_variant:
                    variant = default_variant
                else:
                    raise serializers.ValidationError({
                        'variant_id': 'Selected product is currently out of stock in all sizes/colors.'
                    })
            else:
                if quantity > product.stock:
                    raise serializers.ValidationError({
                        'quantity': f"Requested quantity ({quantity}) exceeds available stock ({product.stock})."
                    })

        attrs['product'] = product
        attrs['variant'] = variant
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    """Validation serializer for updating line item quantity in cart."""

    quantity = serializers.IntegerField(required=True, min_value=1)

    def validate_quantity(self, value):
        cart_item = self.context.get('cart_item')
        if not cart_item:
            return value

        product = cart_item.product
        if value > product.stock:
            raise serializers.ValidationError(
                f"Requested quantity ({value}) exceeds available stock ({product.stock})."
            )
        return value


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer for Wishlist items."""

    product = CartItemProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = WishlistItem
        fields = ('id', 'product', 'product_id', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_product_id(self, value):
        if not Product.objects.filter(pk=value, is_available=True).exists():
            raise serializers.ValidationError('Product does not exist or is unavailable.')
        return value
