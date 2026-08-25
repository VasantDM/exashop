from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Cart, CartItem, WishlistItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    WishlistItemSerializer,
)
from apps.products.models import Product


def get_or_create_cart(request):
    """
    Retrieve or create the shopping cart for the current user or guest session.
    If an authenticated user had a prior guest session cart, merge it into the user cart.
    """
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # Check if guest session key was provided to merge items
        session_key = request.headers.get('X-Session-Key') or request.session.session_key
        if session_key:
            guest_cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
            if guest_cart:
                with transaction.atomic():
                    for g_item in guest_cart.items.all():
                        u_item, created = CartItem.objects.get_or_create(
                            cart=cart,
                            product=g_item.product,
                            variant=g_item.variant,
                            defaults={
                                'quantity': g_item.quantity,
                                'selected_attributes': g_item.selected_attributes
                            }
                        )
                        if not created:
                            # Cap merged quantity at available stock
                            max_stock = g_item.stock_available
                            max_qty = min(max_stock, u_item.quantity + g_item.quantity)
                            u_item.quantity = max_qty
                            u_item.save()
                    guest_cart.delete()
        return cart

    # Guest session cart
    if not request.session.session_key:
        request.session.create()
    session_key = request.headers.get('X-Session-Key') or request.session.session_key
    cart, _ = Cart.objects.get_or_create(session_key=session_key, user__isnull=True)
    return cart


class CartView(APIView):
    """
    GET /api/v1/cart/
    Retrieve current shopping cart with line items, quantities, and calculated totals.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddToCartView(APIView):
    """
    POST /api/v1/cart/items/
    Add a product or variant to the cart or increment quantity if already present.
    Performs real-time stock validation.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        variant = serializer.validated_data.get('variant')
        quantity = serializer.validated_data.get('quantity', 1)

        cart = get_or_create_cart(request)

        attrs = {}
        if variant:
            if variant.color_name:
                attrs['color'] = variant.color_name
            if variant.size:
                attrs['size'] = variant.size
            attrs['sku'] = variant.sku

        # Check if item is already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={
                'quantity': quantity,
                'selected_attributes': attrs
            }
        )

        max_stock = variant.stock if variant else product.stock
        if not created:
            new_quantity = cart_item.quantity + quantity
            if new_quantity > max_stock:
                return Response({
                    'error': 'Stock Limit Exceeded',
                    'detail': f"Cannot add {quantity} more. You have {cart_item.quantity} in cart and only {max_stock} are available.",
                    'available_stock': max_stock,
                    'current_cart_quantity': cart_item.quantity,
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_quantity
            cart_item.save()

        # Return updated cart
        cart_data = CartSerializer(cart).data
        item_desc = f"{product.name} ({variant.color_name} / {variant.size})" if variant else product.name
        return Response({
            'message': f"Added '{item_desc}' to cart.",
            'cart': cart_data
        }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class UpdateCartItemView(APIView):
    """
    PATCH /api/v1/cart/items/<int:pk>/
    Update the quantity of a specific line item in the cart.
    Validates against product available stock.
    """
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        cart = get_or_create_cart(request)
        cart_item = get_object_or_404(CartItem, pk=pk, cart=cart)

        serializer = UpdateCartItemSerializer(
            data=request.data,
            context={'cart_item': cart_item}
        )
        serializer.is_valid(raise_exception=True)

        new_quantity = serializer.validated_data['quantity']
        cart_item.quantity = new_quantity
        cart_item.save()

        cart_data = CartSerializer(cart).data
        return Response({
            'message': 'Cart quantity updated.',
            'cart': cart_data
        }, status=status.HTTP_200_OK)


class RemoveCartItemView(APIView):
    """
    DELETE /api/v1/cart/items/<int:pk>/
    Remove a single line item from the shopping cart.
    """
    permission_classes = [permissions.AllowAny]

    def delete(self, request, pk):
        cart = get_or_create_cart(request)
        cart_item = get_object_or_404(CartItem, pk=pk, cart=cart)
        product_name = cart_item.product.name
        cart_item.delete()

        cart_data = CartSerializer(cart).data
        return Response({
            'message': f"Removed '{product_name}' from cart.",
            'cart': cart_data
        }, status=status.HTTP_200_OK)


class ClearCartView(APIView):
    """
    DELETE /api/v1/cart/clear/
    Empty all line items from the shopping cart.
    """
    permission_classes = [permissions.AllowAny]

    def delete(self, request):
        cart = get_or_create_cart(request)
        cart.items.all().delete()

        cart_data = CartSerializer(cart).data
        return Response({
            'message': 'Shopping cart cleared.',
            'cart': cart_data
        }, status=status.HTTP_200_OK)


class WishlistView(APIView):
    """
    GET /api/v1/cart/wishlist/ - Retrieve all wishlist items.
    POST /api/v1/cart/wishlist/ - Toggle product in or out of wishlist.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related('product')
        serializer = WishlistItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, pk=product_id, is_available=True)
        wishlist_item = WishlistItem.objects.filter(user=request.user, product=product).first()

        if wishlist_item:
            wishlist_item.delete()
            return Response({
                'in_wishlist': False,
                'message': f"Removed '{product.name}' from wishlist."
            }, status=status.HTTP_200_OK)
        else:
            WishlistItem.objects.create(user=request.user, product=product)
            return Response({
                'in_wishlist': True,
                'message': f"Added '{product.name}' to wishlist."
            }, status=status.HTTP_201_CREATED)


class RemoveWishlistView(APIView):
    """
    DELETE /api/v1/cart/wishlist/<int:product_id>/
    Remove specific product from wishlist.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id):
        item = WishlistItem.objects.filter(user=request.user, product_id=product_id).first()
        if item:
            item.delete()
            return Response({'message': 'Removed from wishlist.'}, status=status.HTTP_200_OK)
        return Response({'message': 'Item was not in wishlist.'}, status=status.HTTP_200_OK)
