from decimal import Decimal
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import (
    OrderCreateSerializer,
    OrderListSerializer,
    OrderDetailSerializer,
    OrderStatusHistorySerializer,
)
from apps.cart.models import Cart
from apps.products.models import Product
from apps.users.permissions import IsAdmin


class OrderCreateView(APIView):
    """
    POST /api/v1/orders/create/
    Create a new order atomically from customer's active cart.
    Validates and locks inventory stock, deducts quantities, records address snapshots, and clears cart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        cart = Cart.objects.filter(user=user).first()

        if not cart or cart.items.count() == 0:
            return Response({
                'error': 'Empty Cart',
                'detail': 'Your shopping cart is empty. Please add products before placing an order.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Atomic Execution with Product & Variant Row Locking
        with transaction.atomic():
            cart_items = list(cart.items.select_related('product', 'variant').all())
            locked_products = {}
            locked_variants = {}

            # 1. Lock and Verify Stock for all line items
            for item in cart_items:
                product = Product.objects.select_for_update().filter(pk=item.product_id).first()

                if not product or not product.is_available:
                    return Response({
                        'error': 'Product Unavailable',
                        'detail': f"Product '{item.product.name}' is no longer available."
                    }, status=status.HTTP_400_BAD_REQUEST)

                if item.variant_id:
                    from apps.products.models import ProductVariant
                    variant = ProductVariant.objects.select_for_update().filter(pk=item.variant_id).first()
                    if not variant or not variant.is_active:
                        return Response({
                            'error': 'Variant Unavailable',
                            'detail': f"Selected option for '{product.name}' is no longer available."
                        }, status=status.HTTP_400_BAD_REQUEST)

                    if variant.stock < item.quantity:
                        return Response({
                            'error': 'Insufficient Variant Stock',
                            'detail': f"Insufficient stock for '{product.name}' ({variant.color_name} / {variant.size}). Available: {variant.stock}, in cart: {item.quantity}.",
                            'product_id': product.id,
                            'available_stock': variant.stock
                        }, status=status.HTTP_400_BAD_REQUEST)
                    locked_variants[item.id] = variant
                else:
                    if product.stock < item.quantity:
                        return Response({
                            'error': 'Insufficient Stock',
                            'detail': f"Insufficient stock for '{product.name}'. Available: {product.stock}, in cart: {item.quantity}.",
                            'product_id': product.id,
                            'available_stock': product.stock
                        }, status=status.HTTP_400_BAD_REQUEST)

                locked_products[item.id] = product

            # 2. Financial Calculations
            subtotal = cart.subtotal
            discount_amount = cart.discount_total
            final_subtotal = cart.final_total

            # Promo Code Handling
            promo_code = serializer.validated_data.get('promo_code', '').strip().upper()
            promo_discount = Decimal('0.00')
            if promo_code == 'AURA10':
                promo_discount = final_subtotal * Decimal('0.10')
            elif promo_code == 'AURA20':
                promo_discount = final_subtotal * Decimal('0.20')

            total_discount = discount_amount + promo_discount

            # Free shipping over ₹100
            shipping_fee = Decimal('0.00') if final_subtotal >= Decimal('100.00') else Decimal('15.00')
            tax_amount = Decimal('0.00')

            grand_total = max(Decimal('0.00'), final_subtotal - promo_discount + shipping_fee + tax_amount)

            # 3. Create Order
            order = Order.objects.create(
                user=user,
                shipping_address=serializer.validated_data['resolved_shipping_address'],
                payment_method=serializer.validated_data.get('payment_method', 'razorpay'),
                payment_status='pending',
                status='pending',
                subtotal=subtotal,
                discount_amount=total_discount,
                shipping_fee=shipping_fee,
                tax_amount=tax_amount,
                grand_total=grand_total,
                notes=serializer.validated_data.get('notes', '')
            )

            # 4. Create OrderItems & Deduct Stock
            for item in cart_items:
                product = locked_products[item.id]
                variant = locked_variants.get(item.id)

                if variant:
                    variant.stock -= item.quantity
                    variant.save(update_fields=['stock'])

                if product.stock >= item.quantity:
                    product.stock -= item.quantity
                    product.save(update_fields=['stock'])

                img_url = (variant.image_url if variant and variant.image_url else product.primary_image)

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    variant=variant,
                    product_name=product.name,
                    product_sku=variant.sku if variant else product.sku,
                    product_image=img_url,
                    color_name=variant.color_name if variant else '',
                    size=variant.size if variant else '',
                    variant_details=item.selected_attributes or {},
                    unit_price=item.unit_price,
                    quantity=item.quantity,
                    total_price=item.total_price
                )

            # 5. Create Initial Timeline Event
            OrderStatusHistory.objects.create(
                order=order,
                status='pending',
                message='Order placed successfully by customer.'
            )

            # 6. Clear Customer Cart
            cart.items.all().delete()

        order_data = OrderDetailSerializer(order).data
        return Response({
            'message': f"Order {order.order_number} placed successfully!",
            'order': order_data
        }, status=status.HTTP_201_CREATED)


class OrderListView(APIView):
    """
    GET /api/v1/orders/
    Retrieve list of orders placed by the authenticated customer.
    Optional query filter: ?status=pending
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = Order.objects.filter(user=request.user).prefetch_related('items')

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = OrderListSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    """
    GET /api/v1/orders/<str:order_number>/
    Retrieve full invoice, line items, address, and timeline for a specific order.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        # Allow customer to view their own order, or admin to view any order
        if request.user.is_admin_user:
            order = get_object_or_404(Order, order_number=order_number)
        else:
            order = get_object_or_404(Order, order_number=order_number, user=request.user)

        serializer = OrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderCancelView(APIView):
    """
    POST /api/v1/orders/<str:order_number>/cancel/
    Cancel an active order (pending or processing) and atomically restore inventory stock.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)

        if not order.can_cancel:
            return Response({
                'error': 'Cannot Cancel Order',
                'detail': f"Orders in '{order.get_status_display()}' status cannot be cancelled."
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # 1. Restore Inventory Stock for all items (variants & products)
            for item in order.items.select_related('product', 'variant').all():
                if item.variant:
                    from apps.products.models import ProductVariant
                    variant = ProductVariant.objects.select_for_update().filter(pk=item.variant.id).first()
                    if variant:
                        variant.stock += item.quantity
                        variant.save(update_fields=['stock'])

                if item.product:
                    product = Product.objects.select_for_update().filter(pk=item.product.id).first()
                    if product:
                        product.stock += item.quantity
                        product.save(update_fields=['stock'])

            # 2. Update Status
            order.status = 'cancelled'
            if order.payment_status == 'paid':
                order.payment_status = 'refunded'
            order.save()

            # 3. Add Timeline Log
            OrderStatusHistory.objects.create(
                order=order,
                status='cancelled',
                message='Order cancelled by customer. Inventory stock refunded.'
            )

        order_data = OrderDetailSerializer(order).data
        return Response({
            'message': f"Order {order.order_number} has been cancelled and stock was restored.",
            'order': order_data
        }, status=status.HTTP_200_OK)


class AdminOrderStatusUpdateView(APIView):
    """
    PATCH /api/v1/orders/<str:order_number>/status/
    Admin / Staff endpoint to update order status, tracking number, and append timeline event.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number)
        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')
        message = request.data.get('message')

        if not new_status or new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        if tracking_number:
            order.tracking_number = tracking_number
        order.save()

        # Append timeline entry
        default_message = f"Status updated to {order.get_status_display()}."
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            message=message or default_message
        )

        order_data = OrderDetailSerializer(order).data
        return Response({
            'message': f"Order {order.order_number} status updated to {new_status}.",
            'order': order_data
        }, status=status.HTTP_200_OK)
