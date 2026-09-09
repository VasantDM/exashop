from rest_framework import serializers
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.products.models import Product, ProductImage, ProductVariant, Brand
from apps.categories.models import Category
from apps.orders.models import Order, OrderItem, OrderStatusHistory

User = get_user_model()


class AdminCategorySerializer(serializers.ModelSerializer):
    """Admin Serializer for Categories with live product count and hierarchy."""
    products_count = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'parent',
            'parent_name',
            'is_active',
            'products_count',
            'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def get_products_count(self, obj):
        return obj.products.count()


class AdminProductVariantSerializer(serializers.ModelSerializer):
    """Admin Serializer for managing size and color product variants."""
    current_price = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = (
            'id',
            'product',
            'sku',
            'color_name',
            'color_code',
            'size',
            'price_override',
            'current_price',
            'stock',
            'image_url',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'current_price', 'created_at', 'updated_at')


class AdminProductImageSerializer(serializers.ModelSerializer):
    """Admin Serializer for Product Images with color variant association."""
    display_image = serializers.ReadOnlyField()

    class Meta:
        model = ProductImage
        fields = (
            'id',
            'product',
            'image',
            'image_url',
            'color_name',
            'display_image',
            'alt_text',
            'is_primary',
            'created_at',
        )
        read_only_fields = ('id', 'display_image', 'created_at')


class AdminProductSerializer(serializers.ModelSerializer):
    """Comprehensive Admin Product Serializer with multi-images, color-wise galleries, variants, category and brand info."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    variants = AdminProductVariantSerializer(many=True, read_only=True)
    images = AdminProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()
    has_variants = serializers.ReadOnlyField()
    variants_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()

    # Inputs for quick creation / update with multiple color-specific images and variants
    initial_image_url = serializers.URLField(write_only=True, required=False, allow_blank=True)
    initial_images = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    initial_variants = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'sku',
            'short_description',
            'description',
            'price',
            'discount_price',
            'current_price',
            'category',
            'category_name',
            'brand',
            'brand_name',
            'stock',
            'total_stock',
            'is_available',
            'is_featured',
            'average_rating',
            'reviews_count',
            'primary_image',
            'has_variants',
            'variants_count',
            'variants',
            'images',
            'initial_image_url',
            'initial_images',
            'initial_variants',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'current_price', 'primary_image', 'created_at', 'updated_at')

    def get_variants_count(self, obj):
        return obj.variants.count()

    def get_total_stock(self, obj):
        if obj.variants.exists():
            return sum(v.stock for v in obj.variants.all())
        return obj.stock

    def create(self, validated_data):
        initial_images = validated_data.pop('initial_images', None)
        initial_image_url = validated_data.pop('initial_image_url', None)
        initial_variants = validated_data.pop('initial_variants', None)

        product = Product.objects.create(**validated_data)

        # Handle multiple images with optional color association
        if initial_images and isinstance(initial_images, list):
            for idx, img_data in enumerate(initial_images):
                url = img_data.get('image_url') or img_data.get('url') or img_data.get('display_image')
                if url:
                    ProductImage.objects.create(
                        product=product,
                        image_url=url,
                        color_name=img_data.get('color_name', '').strip(),
                        alt_text=img_data.get('alt_text', f"{product.name} Image {idx + 1}"),
                        is_primary=bool(img_data.get('is_primary', idx == 0))
                    )
        elif initial_image_url:
            ProductImage.objects.create(
                product=product,
                image_url=initial_image_url,
                alt_text=f"{product.name} Main Photo",
                is_primary=True
            )

        # Handle variants
        if initial_variants and isinstance(initial_variants, list):
            for var_data in initial_variants:
                sku = var_data.get('sku') or f"{product.sku}-{var_data.get('size', 'X')}-{var_data.get('color_name', 'C')[:3].upper()}"
                
                v_color = var_data.get('color_name', '').strip()
                v_img = var_data.get('image_url')
                if not v_img and v_color:
                    matched_img = product.images.filter(color_name__iexact=v_color).first()
                    if matched_img:
                        v_img = matched_img.display_image

                ProductVariant.objects.create(
                    product=product,
                    sku=sku,
                    color_name=v_color,
                    color_code=var_data.get('color_code', '#111827'),
                    size=var_data.get('size', ''),
                    stock=int(var_data.get('stock', 0)),
                    price_override=var_data.get('price_override'),
                    image_url=v_img or initial_image_url or product.primary_image,
                    is_active=True
                )

        return product

    def update(self, instance, validated_data):
        initial_images = validated_data.pop('initial_images', None)
        initial_image_url = validated_data.pop('initial_image_url', None)
        initial_variants = validated_data.pop('initial_variants', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update images if passed
        if initial_images is not None and isinstance(initial_images, list):
            instance.images.all().delete()
            for idx, img_data in enumerate(initial_images):
                url = img_data.get('image_url') or img_data.get('url') or img_data.get('display_image')
                if url:
                    ProductImage.objects.create(
                        product=instance,
                        image_url=url,
                        color_name=img_data.get('color_name', '').strip(),
                        alt_text=img_data.get('alt_text', f"{instance.name} Image {idx + 1}"),
                        is_primary=bool(img_data.get('is_primary', idx == 0))
                    )
        elif initial_image_url:
            if not instance.images.filter(image_url=initial_image_url).exists():
                ProductImage.objects.create(
                    product=instance,
                    image_url=initial_image_url,
                    alt_text=f"{instance.name} Photo",
                    is_primary=True
                )

        # Update variants if passed
        if initial_variants is not None and isinstance(initial_variants, list):
            instance.variants.all().delete()
            for var_data in initial_variants:
                sku = var_data.get('sku') or f"{instance.sku}-{var_data.get('size', 'X')}-{var_data.get('color_name', 'C')[:3].upper()}"
                
                v_color = var_data.get('color_name', '').strip()
                v_img = var_data.get('image_url')
                if not v_img and v_color:
                    matched_img = instance.images.filter(color_name__iexact=v_color).first()
                    if matched_img:
                        v_img = matched_img.display_image

                ProductVariant.objects.create(
                    product=instance,
                    sku=sku,
                    color_name=v_color,
                    color_code=var_data.get('color_code', '#111827'),
                    size=var_data.get('size', ''),
                    stock=int(var_data.get('stock', 0)),
                    price_override=var_data.get('price_override'),
                    image_url=v_img or instance.primary_image,
                    is_active=True
                )

        return instance


class AdminOrderItemSerializer(serializers.ModelSerializer):
    """Admin Order Item Serializer with variant snapshot."""
    class Meta:
        model = OrderItem
        fields = (
            'id',
            'product_name',
            'product_sku',
            'product_image',
            'color_name',
            'size',
            'variant_details',
            'unit_price',
            'quantity',
            'total_price',
        )


class AdminOrderListSerializer(serializers.ModelSerializer):
    """Admin Order Overview Serializer."""
    customer_email = serializers.CharField(source='user.email', read_only=True)
    customer_name = serializers.CharField(source='user.full_name', read_only=True)
    total_items = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'customer_email',
            'customer_name',
            'status',
            'status_display',
            'payment_status',
            'payment_status_display',
            'payment_method',
            'grand_total',
            'total_items',
            'tracking_number',
            'formatted_date',
            'created_at',
        )

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%b %d, %Y - %I:%M %p')


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    """Comprehensive Admin Order Detail Serializer with shipping snapshot and full timeline."""
    customer_email = serializers.CharField(source='user.email', read_only=True)
    customer_name = serializers.CharField(source='user.full_name', read_only=True)
    customer_phone = serializers.CharField(source='user.phone_number', read_only=True)
    items = AdminOrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    timeline = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'customer_email',
            'customer_name',
            'customer_phone',
            'status',
            'status_display',
            'payment_status',
            'payment_status_display',
            'payment_method',
            'payment_method_display',
            'shipping_address',
            'subtotal',
            'discount_amount',
            'shipping_fee',
            'tax_amount',
            'grand_total',
            'tracking_number',
            'notes',
            'items',
            'timeline',
            'formatted_date',
            'created_at',
            'updated_at',
        )

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%b %d, %Y - %I:%M %p')

    def get_timeline(self, obj):
        return [
            {
                'id': t.id,
                'status': t.status,
                'message': t.message,
                'created_at': t.created_at.strftime('%b %d, %Y - %I:%M %p')
            }
            for t in obj.timeline.all()
        ]


class AdminCustomerSerializer(serializers.ModelSerializer):
    """Admin Serializer for Registered Customer Accounts with spending & order analytics."""
    full_name = serializers.ReadOnlyField()
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    joined_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'role',
            'is_active',
            'is_verified',
            'total_orders',
            'total_spent',
            'joined_date',
            'created_at',
        )

    def get_total_orders(self, obj):
        return obj.orders.count()

    def get_total_spent(self, obj):
        paid_orders = obj.orders.filter(payment_status='paid')
        total = sum(order.grand_total for order in paid_orders)
        return f"{total:.2f}"

    def get_joined_date(self, obj):
        return obj.created_at.strftime('%b %d, %Y')
