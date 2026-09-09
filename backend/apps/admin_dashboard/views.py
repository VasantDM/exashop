from rest_framework import status, permissions, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.products.models import Product, ProductVariant, ProductImage, Brand
from apps.categories.models import Category
from apps.orders.models import Order, OrderItem, OrderStatusHistory
from django.contrib.auth import get_user_model
from apps.users.permissions import IsAdmin

from .serializers import (
    AdminCategorySerializer,
    AdminProductSerializer,
    AdminProductVariantSerializer,
    AdminProductImageSerializer,
    AdminOrderListSerializer,
    AdminOrderDetailSerializer,
    AdminCustomerSerializer,
)
from apps.users.serializers import (
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
)

User = get_user_model()


class AdminDashboardOverviewView(APIView):
    """
    GET /api/v1/admin/dashboard/
    Executive KPI statistics, revenue metrics, low-stock radar, and recent activities.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # 1. KPIs
        paid_orders = Order.objects.filter(payment_status='paid')
        total_revenue = paid_orders.aggregate(total=Sum('grand_total'))['total'] or Decimal('0.00')

        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_customers = User.objects.filter(role='customer').count()

        pending_orders = Order.objects.filter(status='pending').count()
        processing_orders = Order.objects.filter(status='processing').count()
        shipped_orders = Order.objects.filter(status='shipped').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()

        # 2. Low-stock radar (products or variants with stock <= 5)
        low_stock_products = Product.objects.filter(stock__lte=5).select_related('category')[:8]
        low_stock_variants = ProductVariant.objects.filter(stock__lte=5).select_related('product')[:8]

        low_stock_items = []
        for p in low_stock_products:
            if not p.has_variants:
                low_stock_items.append({
                    'id': p.id,
                    'type': 'product',
                    'name': p.name,
                    'sku': p.sku,
                    'stock': p.stock,
                    'image': p.primary_image,
                    'category': p.category.name if p.category else 'General'
                })
        for v in low_stock_variants:
            low_stock_items.append({
                'id': v.id,
                'type': 'variant',
                'name': f"{v.product.name} ({v.color_name} / {v.size})",
                'sku': v.sku,
                'stock': v.stock,
                'image': v.image_url or v.product.primary_image,
                'category': v.product.category.name if v.product.category else 'Apparel'
            })

        # 3. Recent 6 Orders
        recent_orders_qs = Order.objects.select_related('user').order_by('-created_at')[:6]
        recent_orders = AdminOrderListSerializer(recent_orders_qs, many=True).data

        # 4. Sales Trend (Last 7 Days)
        sales_trend = []
        for i in range(6, -1, -1):
            day_date = (now - timedelta(days=i)).date()
            day_revenue = Order.objects.filter(
                payment_status='paid',
                created_at__date=day_date
            ).aggregate(total=Sum('grand_total'))['total'] or Decimal('0.00')

            day_orders_count = Order.objects.filter(created_at__date=day_date).count()

            sales_trend.append({
                'date': day_date.strftime('%b %d'),
                'revenue': float(day_revenue),
                'orders': day_orders_count
            })

        # 5. Top Categories Overview
        categories_overview = []
        for cat in Category.objects.annotate(p_count=Count('products')).order_by('-p_count')[:6]:
            categories_overview.append({
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
                'products_count': cat.p_count
            })

        return Response({
            'kpis': {
                'total_revenue': f"{total_revenue:.2f}",
                'total_orders': total_orders,
                'total_products': total_products,
                'total_customers': total_customers,
                'pending_orders': pending_orders,
                'processing_orders': processing_orders,
                'shipped_orders': shipped_orders,
                'delivered_orders': delivered_orders,
                'cancelled_orders': cancelled_orders,
                'low_stock_count': len(low_stock_items),
            },
            'recent_orders': recent_orders,
            'low_stock_items': low_stock_items[:8],
            'sales_trend': sales_trend,
            'categories_overview': categories_overview,
        }, status=status.HTTP_200_OK)


class AdminProductListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/admin/products/ -> Full product list with search and filters.
    POST /api/v1/admin/products/ -> Create a new product with optional initial variants & image.
    """
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'description', 'category__name', 'brand__name']
    ordering_fields = ['created_at', 'price', 'stock', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.all().select_related('category', 'brand').prefetch_related('variants', 'images')

        # Filter by category
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by in_stock
        in_stock = self.request.query_params.get('in_stock')
        if in_stock in ('true', '1'):
            queryset = queryset.filter(stock__gt=0)
        elif in_stock in ('false', '0'):
            queryset = queryset.filter(stock=0)

        return queryset


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/v1/admin/products/<int:pk>/ -> Full product record.
    PATCH /api/v1/admin/products/<int:pk>/ -> Update product details.
    DELETE /api/v1/admin/products/<int:pk>/ -> Delete product.
    """
    queryset = Product.objects.all().select_related('category', 'brand').prefetch_related('variants', 'images')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdmin]


class AdminProductVariantCreateView(APIView):
    """
    POST /api/v1/admin/products/<int:pk>/variants/
    Add a new Size/Color variant to an existing product.
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        data = request.data.copy()
        data['product'] = product.id

        if not data.get('sku'):
            data['sku'] = f"{product.sku}-{data.get('size', 'X')}-{data.get('color_name', 'C')[:3].upper()}"

        serializer = AdminProductVariantSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        variant = serializer.save()

        return Response({
            'message': f"Variant '{variant.color_name} / {variant.size}' added successfully.",
            'variant': serializer.data
        }, status=status.HTTP_201_CREATED)


class AdminProductVariantDeleteView(APIView):
    """
    DELETE /api/v1/admin/products/variants/<int:var_pk>/
    Delete a specific variant.
    """
    permission_classes = [IsAdmin]

    def delete(self, request, var_pk):
        variant = get_object_or_404(ProductVariant, pk=var_pk)
        name = str(variant)
        variant.delete()
        return Response({'message': f"Variant '{name}' deleted."}, status=status.HTTP_200_OK)


class AdminProductImageCreateView(APIView):
    """
    POST /api/v1/admin/products/<int:pk>/images/
    Add a new gallery photo or color-specific image to an existing product.
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        data = request.data.copy()
        data['product'] = product.id

        serializer = AdminProductImageSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        img = serializer.save()

        return Response({
            'message': 'Image added successfully.',
            'image': serializer.data
        }, status=status.HTTP_201_CREATED)


class AdminProductImageDeleteView(APIView):
    """
    DELETE /api/v1/admin/products/images/<int:img_pk>/
    Delete a specific product image.
    """
    permission_classes = [IsAdmin]

    def delete(self, request, img_pk):
        image = get_object_or_404(ProductImage, pk=img_pk)
        image.delete()
        return Response({'message': 'Product image deleted.'}, status=status.HTTP_200_OK)


class AdminProductImageSetPrimaryView(APIView):
    """
    PATCH /api/v1/admin/products/images/<int:img_pk>/primary/
    Set this image as the main primary thumbnail.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, img_pk):
        image = get_object_or_404(ProductImage, pk=img_pk)
        image.is_primary = True
        image.save()
        return Response({
            'message': 'Image set as primary thumbnail.',
            'image': AdminProductImageSerializer(image).data
        }, status=status.HTTP_200_OK)


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/admin/categories/ -> All categories with live product count.
    POST /api/v1/admin/categories/ -> Create new category.
    """
    queryset = Category.objects.all().select_related('parent').order_by('name')
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdmin]
    search_fields = ['name', 'description']


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    PATCH /api/v1/admin/categories/<int:pk>/ -> Update category.
    DELETE /api/v1/admin/categories/<int:pk>/ -> Delete category.
    """
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdmin]


class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/v1/admin/orders/
    Paginated order list with search by order number or customer email, and status filter.
    """
    serializer_class = AdminOrderListSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'user__email', 'user__first_name', 'user__last_name', 'tracking_number']
    ordering_fields = ['created_at', 'grand_total', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Order.objects.all().select_related('user').prefetch_related('items')

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter.lower() != 'all':
            queryset = queryset.filter(status=status_filter.lower())

        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status')
        if payment_status and payment_status.lower() != 'all':
            queryset = queryset.filter(payment_status=payment_status.lower())

        return queryset


class AdminOrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/admin/orders/<str:order_number>/
    Complete customer order invoice details.
    """
    queryset = Order.objects.all().select_related('user').prefetch_related('items', 'timeline')
    serializer_class = AdminOrderDetailSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'order_number'


class AdminOrderStatusUpdateView(APIView):
    """
    PATCH /api/v1/admin/orders/<str:order_number>/status/
    Update order status, assign tracking number, and log timeline activity.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number)

        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')
        custom_message = request.data.get('message', '')

        if not new_status:
            return Response({'error': 'Status field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({
                'error': f"Invalid status '{new_status}'. Choices are: {', '.join(valid_statuses)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        order.status = new_status

        if tracking_number:
            order.tracking_number = tracking_number.strip()

        order.save()

        # Generate timeline log
        status_labels = dict(Order.STATUS_CHOICES)
        default_msg = f"Order status updated from {status_labels.get(old_status, old_status)} to {status_labels.get(new_status, new_status)}."
        if tracking_number:
            default_msg += f" Tracking number: {tracking_number}."

        msg_to_save = custom_message.strip() if custom_message.strip() else default_msg

        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            message=msg_to_save
        )

        serializer = AdminOrderDetailSerializer(order)
        return Response({
            'message': f"Order {order.order_number} status updated to {new_status.upper()}.",
            'order': serializer.data
        }, status=status.HTTP_200_OK)


class AdminUserListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/admin/customers/ or /api/v1/admin/users/
    List registered accounts with spending stats, filterable by role (?role=all, customer, admin, staff).
    Includes role count breakdown stats in response.

    POST /api/v1/admin/customers/ or /api/v1/admin/users/
    Admin registration of new user accounts with designated role (Customer, Admin, Staff).
    """
    serializer_class = AdminCustomerSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone_number']
    ordering_fields = ['created_at', 'email', 'first_name', 'role']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = User.objects.all().prefetch_related('orders')

        role_filter = self.request.query_params.get('role')
        if role_filter and role_filter.lower() != 'all':
            queryset = queryset.filter(role=role_filter.lower())

        status_filter = self.request.query_params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Aggregate user counts across all roles and active states for real-time tab metrics
        all_users = User.objects.all()
        stats = {
            'total': all_users.count(),
            'active': all_users.filter(is_active=True).count(),
            'inactive': all_users.filter(is_active=False).count(),
            'customers': all_users.filter(role='customer').count(),
            'admins': all_users.filter(role='admin').count(),
            'staff': all_users.filter(role='staff').count(),
        }

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['stats'] = stats
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'stats': stats,
        })

    def create(self, request, *args, **kwargs):
        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        output_serializer = AdminCustomerSerializer(user)
        return Response({
            'message': f"Account for '{user.email}' created successfully with role '{user.role.upper()}'.",
            'user': output_serializer.data
        }, status=status.HTTP_201_CREATED)


AdminCustomerListView = AdminUserListCreateView


class AdminCustomerToggleActiveView(APIView):
    """
    PATCH /api/v1/admin/customers/<int:pk>/toggle-active/
    Toggle customer account active / blocked status.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user.is_superuser and user.id == request.user.id:
            return Response({'error': 'Cannot disable your own active superuser account.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])

        return Response({
            'message': f"User account for '{user.email}' is now {'ACTIVE' if user.is_active else 'INACTIVE (Deactivated)'}.",
            'is_active': user.is_active
        }, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    """
    GET /api/v1/admin/users/<int:pk>/ -> Retrieve user details
    PATCH /api/v1/admin/users/<int:pk>/ -> Update user details / role / active state
    DELETE /api/v1/admin/users/<int:pk>/ -> Soft delete user account (sets is_active=False, no permanent deletion)
    """
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        user = get_object_or_404(User.objects.prefetch_related('orders'), pk=pk)
        serializer = AdminCustomerSerializer(user)
        return Response(serializer.data)

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()
        output_serializer = AdminCustomerSerializer(updated_user)
        return Response({
            'message': f"User '{updated_user.email}' updated successfully.",
            'user': output_serializer.data
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user.id == request.user.id:
            return Response({'error': 'You cannot deactivate your own logged-in administrator account.'}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser:
            return Response({'error': 'Superuser accounts cannot be deactivated directly.'}, status=status.HTTP_400_BAD_REQUEST)

        # Soft delete: mark account as inactive instead of permanent deletion
        user.soft_delete()
        return Response({
            'message': f"User account '{user.email}' has been deactivated (marked inactive). Account was not deleted permanently.",
            'is_active': False
        }, status=status.HTTP_200_OK)


class AdminInventoryListView(APIView):
    """
    GET /api/v1/admin/inventory/
    Comprehensive inventory radar showing parent products and variants with current stock levels.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        low_stock_only = request.query_params.get('low_stock', 'false').lower() in ('true', '1')
        search = request.query_params.get('search', '').strip()

        products_qs = Product.objects.all().select_related('category', 'brand').prefetch_related('variants').order_by('name')

        if search:
            products_qs = products_qs.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(variants__sku__icontains=search)
            ).distinct()

        inventory_records = []
        for p in products_qs:
            variants = list(p.variants.all())
            if variants:
                for v in variants:
                    if low_stock_only and v.stock > 5:
                        continue
                    inventory_records.append({
                        'id': v.id,
                        'product_id': p.id,
                        'is_variant': True,
                        'name': f"{p.name} - {v.color_name} / {v.size}",
                        'product_name': p.name,
                        'color_name': v.color_name,
                        'color_code': v.color_code,
                        'size': v.size,
                        'sku': v.sku,
                        'stock': v.stock,
                        'price': str(v.current_price),
                        'category': p.category.name if p.category else 'Apparel',
                        'image': v.image_url or p.primary_image,
                        'is_low_stock': v.stock <= 5,
                        'is_out_of_stock': v.stock <= 0,
                    })
            else:
                if low_stock_only and p.stock > 5:
                    continue
                inventory_records.append({
                    'id': p.id,
                    'product_id': p.id,
                    'is_variant': False,
                    'name': p.name,
                    'product_name': p.name,
                    'color_name': '',
                    'color_code': '',
                    'size': '',
                    'sku': p.sku,
                    'stock': p.stock,
                    'price': str(p.current_price),
                    'category': p.category.name if p.category else 'General',
                    'image': p.primary_image,
                    'is_low_stock': p.stock <= 5,
                    'is_out_of_stock': p.stock <= 0,
                })

        return Response({
            'total_items': len(inventory_records),
            'items': inventory_records
        }, status=status.HTTP_200_OK)


class AdminInventoryQuickUpdateView(APIView):
    """
    POST /api/v1/admin/inventory/update-stock/
    Quick stock adjustment for a single product or variant.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        item_id = request.data.get('id')
        is_variant = request.data.get('is_variant', False)
        new_stock = request.data.get('stock')
        delta = request.data.get('delta') # Optional: +1, -1, +5, etc.

        if item_id is None:
            return Response({'error': 'Item ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if is_variant:
            item = get_object_or_404(ProductVariant, pk=item_id)
        else:
            item = get_object_or_404(Product, pk=item_id)

        if delta is not None:
            item.stock = max(0, item.stock + int(delta))
        elif new_stock is not None:
            item.stock = max(0, int(new_stock))
        else:
            return Response({'error': 'Either stock or delta must be provided.'}, status=status.HTTP_400_BAD_REQUEST)

        item.save(update_fields=['stock'])

        return Response({
            'message': f"Stock for '{item.sku}' updated to {item.stock}.",
            'id': item.id,
            'is_variant': is_variant,
            'stock': item.stock
        }, status=status.HTTP_200_OK)
