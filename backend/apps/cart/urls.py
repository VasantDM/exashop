from django.urls import path
from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView,
    WishlistView,
    RemoveWishlistView,
)

app_name = 'cart'

urlpatterns = [
    # Cart routes
    path('', CartView.as_view(), name='cart-detail'),
    path('items/', AddToCartView.as_view(), name='cart-add-item'),
    path('items/<int:pk>/', UpdateCartItemView.as_view(), name='cart-update-item'),
    path('items/<int:pk>/remove/', RemoveCartItemView.as_view(), name='cart-remove-item'),
    path('clear/', ClearCartView.as_view(), name='cart-clear'),

    # Wishlist routes
    path('wishlist/', WishlistView.as_view(), name='wishlist-list-toggle'),
    path('wishlist/<int:product_id>/', RemoveWishlistView.as_view(), name='wishlist-remove'),
]
