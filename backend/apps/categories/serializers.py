from rest_framework import serializers
from .models import Category


class SubCategorySerializer(serializers.ModelSerializer):
    """Minimal serializer for nested child subcategories."""
    product_count = serializers.ReadOnlyField()
    display_image = serializers.ReadOnlyField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon', 'display_image', 'product_count')


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer with subcategories and product counts."""
    subcategories = SubCategorySerializer(many=True, read_only=True)
    product_count = serializers.ReadOnlyField()
    display_image = serializers.ReadOnlyField()

    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'image',
            'image_url',
            'display_image',
            'icon',
            'parent',
            'subcategories',
            'product_count',
            'is_active',
            'created_at',
        )
        read_only_fields = ('id', 'slug', 'display_image', 'product_count', 'created_at')
