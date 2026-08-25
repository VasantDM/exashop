from django.contrib import admin
from .models import Brand, Product, ProductImage, ProductVariant


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'image_url', 'alt_text', 'is_primary')


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('color_name', 'color_code', 'size', 'sku', 'price_override', 'stock', 'image_url', 'is_active')


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'website', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'sku',
        'category',
        'brand',
        'price',
        'discount_price',
        'stock',
        'is_available',
        'is_featured',
        'created_at',
    )
    list_filter = ('is_available', 'is_featured', 'category', 'brand')
    search_fields = ('name', 'sku', 'description', 'brand__name', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductVariantInline]
    ordering = ('-created_at',)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'is_primary', 'created_at')
    list_filter = ('is_primary',)
    search_fields = ('product__name', 'alt_text')


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'color_name', 'size', 'sku', 'stock', 'price_override', 'is_active')
    list_filter = ('color_name', 'size', 'is_active')
    search_fields = ('sku', 'product__name', 'color_name', 'size')
