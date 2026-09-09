from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F, Case, When, DecimalField

from .models import Brand, Product, ProductImage
from .serializers import (
    BrandSerializer,
    ProductImageSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
)
from apps.categories.models import Category
from apps.categories.views import IsAdminOrReadOnly


class BrandListView(generics.ListCreateAPIView):
    """
    List all active brands or create a new brand (Admin only).
    """
    queryset = Brand.objects.filter(is_active=True).order_by('name')
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['name', 'description']


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a brand by slug or ID.
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_object(self):
        lookup_val = self.kwargs.get(self.lookup_field)
        if lookup_val and lookup_val.isdigit():
            self.lookup_field = 'pk'
        return super().get_object()


class ProductListView(generics.ListCreateAPIView):
    """
    List products with multi-parameter search, category & brand filtering,
    price range filtering, stock status, and sorting with pagination.
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'sku', 'brand__name', 'category__name']
    ordering_fields = ['price', 'created_at', 'average_rating', 'name', 'stock']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True).select_related('category', 'brand').prefetch_related('images', 'variants')

        # 1. Search Query
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(short_description__icontains=search_query) |
                Q(sku__icontains=search_query) |
                Q(brand__name__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        # 2. Category Filter (by slug or ID, including subcategories)
        category_param = self.request.query_params.get('category', '').strip()
        category_id = self.request.query_params.get('category_id', '').strip()

        if category_param:
            cat_obj = Category.objects.filter(slug__iexact=category_param).first()
            if cat_obj:
                cat_ids = [cat_obj.id] + list(cat_obj.subcategories.values_list('id', flat=True))
                queryset = queryset.filter(category_id__in=cat_ids)
            else:
                queryset = queryset.filter(category__slug__iexact=category_param)
        elif category_id and category_id.isdigit():
            cat_obj = Category.objects.filter(id=int(category_id)).first()
            if cat_obj:
                cat_ids = [cat_obj.id] + list(cat_obj.subcategories.values_list('id', flat=True))
                queryset = queryset.filter(category_id__in=cat_ids)

        # 3. Brand Filter (by slug, ID, or comma-separated list)
        brand_param = self.request.query_params.get('brand', '').strip()
        brand_id = self.request.query_params.get('brand_id', '').strip()

        if brand_param:
            brand_slugs = [b.strip() for b in brand_param.split(',') if b.strip()]
            queryset = queryset.filter(brand__slug__in=brand_slugs)
        elif brand_id and brand_id.isdigit():
            queryset = queryset.filter(brand_id=int(brand_id))

        # 4. Price Range Filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if min_price:
            try:
                min_val = float(min_price)
                queryset = queryset.filter(
                    Q(discount_price__gte=min_val) |
                    (Q(discount_price__isnull=True) & Q(price__gte=min_val))
                )
            except ValueError:
                pass

        if max_price:
            try:
                max_val = float(max_price)
                queryset = queryset.filter(
                    Q(discount_price__lte=max_val, discount_price__isnull=False) |
                    (Q(discount_price__isnull=True) & Q(price__lte=max_val))
                )
            except ValueError:
                pass

        # 5. In-Stock Filter
        in_stock_param = self.request.query_params.get('in_stock')
        if in_stock_param and in_stock_param.lower() in ('true', '1'):
            queryset = queryset.filter(stock__gt=0)

        # 6. Featured Filter
        featured_param = self.request.query_params.get('featured')
        if featured_param and featured_param.lower() in ('true', '1'):
            queryset = queryset.filter(is_featured=True)

        # 7. Sorting / Ordering
        ordering_param = self.request.query_params.get('ordering', '').strip()
        if ordering_param == 'price':
            # Sort ascending by effective price (discount_price if available, else price)
            queryset = queryset.annotate(
                effective_price=Case(
                    When(discount_price__isnull=False, then=F('discount_price')),
                    default=F('price'),
                    output_field=DecimalField()
                )
            ).order_by('effective_price')
        elif ordering_param == '-price':
            # Sort descending by effective price
            queryset = queryset.annotate(
                effective_price=Case(
                    When(discount_price__isnull=False, then=F('discount_price')),
                    default=F('price'),
                    output_field=DecimalField()
                )
            ).order_by('-effective_price')
        elif ordering_param:
            queryset = queryset.order_by(ordering_param)

        return queryset


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a product by slug or ID.
    Returns full product details, image gallery, category and brand metadata.
    """
    queryset = Product.objects.all().select_related('category', 'brand').prefetch_related('images', 'variants')
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def get_object(self):
        lookup_val = self.kwargs.get(self.lookup_field)
        if not lookup_val:
            return super().get_object()

        if lookup_val.isdigit():
            obj = self.get_queryset().filter(pk=int(lookup_val)).first()
            if obj:
                return obj

        # 1. Exact slug match
        obj = self.get_queryset().filter(slug__iexact=lookup_val).first()
        if obj:
            return obj

        # 2. Case-insensitive slug contains or name match (e.g. 'shirt' matching 't-shirt')
        obj = self.get_queryset().filter(
            Q(slug__icontains=lookup_val) |
            Q(name__iexact=lookup_val) |
            Q(name__icontains=lookup_val)
        ).first()
        if obj:
            return obj

        return super().get_object()


class FeaturedProductsView(generics.ListAPIView):
    """
    Fast endpoint to list featured products for hero sections and home page showcases.
    """
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            is_available=True,
            is_featured=True
        ).select_related('category', 'brand').prefetch_related('images', 'variants').order_by('-created_at')[:8]
