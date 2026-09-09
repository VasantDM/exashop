from rest_framework import serializers
from .models import Brand, Product, ProductImage, ProductVariant
from apps.categories.serializers import CategorySerializer


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand entities."""
    display_logo = serializers.ReadOnlyField()

    class Meta:
        model = Brand
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'logo',
            'logo_url',
            'display_logo',
            'website',
            'is_active',
        )
        read_only_fields = ('id', 'slug', 'display_logo')


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for Product Gallery Images with color variant association."""
    display_image = serializers.ReadOnlyField()

    class Meta:
        model = ProductImage
        fields = (
            'id',
            'image',
            'image_url',
            'color_name',
            'display_image',
            'alt_text',
            'is_primary',
            'created_at',
        )
        read_only_fields = ('id', 'display_image', 'created_at')


class ProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for Product Variants (Size, Color, Variant SKU & Stock)."""
    current_price = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

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
            'in_stock',
            'image_url',
            'is_active',
            'created_at',
        )
        read_only_fields = ('id', 'current_price', 'in_stock', 'created_at')


class ProductListSerializer(serializers.ModelSerializer):
    """Streamlined Product Serializer for product cards, grid views, and search listings."""

    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    brand_slug = serializers.CharField(source='brand.slug', read_only=True)
    primary_image = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()
    has_discount = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    has_variants = serializers.ReadOnlyField()
    available_colors = serializers.ReadOnlyField()
    available_sizes = serializers.ReadOnlyField()
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'sku',
            'short_description',
            'price',
            'discount_price',
            'current_price',
            'has_discount',
            'discount_percentage',
            'category',
            'category_name',
            'category_slug',
            'brand',
            'brand_name',
            'brand_slug',
            'stock',
            'in_stock',
            'has_variants',
            'available_colors',
            'available_sizes',
            'variants',
            'is_available',
            'is_featured',
            'average_rating',
            'reviews_count',
            'primary_image',
            'created_at',
        )
        read_only_fields = ('id', 'slug', 'created_at')


class ProductDetailSerializer(serializers.ModelSerializer):
    """Comprehensive Product Detail Serializer with full specs, image gallery, variants, and colors."""

    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    primary_image = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()
    has_discount = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    has_variants = serializers.ReadOnlyField()
    available_colors = serializers.ReadOnlyField()
    available_sizes = serializers.ReadOnlyField()

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
            'has_discount',
            'discount_percentage',
            'category',
            'brand',
            'images',
            'variants',
            'has_variants',
            'available_colors',
            'available_sizes',
            'stock',
            'in_stock',
            'is_available',
            'is_featured',
            'average_rating',
            'reviews_count',
            'primary_image',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for Admin product creation and updates."""

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'sku',
            'short_description',
            'description',
            'price',
            'discount_price',
            'category',
            'brand',
            'stock',
            'is_available',
            'is_featured',
        )
        read_only_fields = ('id',)
