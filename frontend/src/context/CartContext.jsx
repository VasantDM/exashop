import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getCart, 
  addToCart as addToCartApi, 
  updateCartItem as updateCartItemApi, 
  removeCartItem as removeCartItemApi, 
  clearCart as clearCartApi,
  getWishlist as getWishlistApi,
  toggleWishlist as toggleWishlistApi
} from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Generate unique session key for guest carts
const getOrCreateSessionKey = () => {
  let key = localStorage.getItem('cart_session_key');
  if (!key) {
    key = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('cart_session_key', key);
  }
  return key;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [cart, setCart] = useState({
    items: [],
    total_items: 0,
    subtotal: '0.00',
    discount_total: '0.00',
    final_total: '0.00',
  });
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const sessionKey = getOrCreateSessionKey();

  // Show auto-dismissing toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Cart from Backend
  const refreshCart = useCallback(async () => {
    try {
      const data = await getCart(sessionKey);
      setCart({
        items: data.items || [],
        total_items: data.total_items || 0,
        subtotal: data.subtotal || '0.00',
        discount_total: data.discount_total || '0.00',
        final_total: data.final_total || '0.00',
      });
      return data;
    } catch (err) {
      console.warn('Could not fetch cart:', err);
    }
  }, [sessionKey]);

  // Fetch Wishlist from Backend or localStorage
  const refreshWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const data = await getWishlistApi();
        setWishlist(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Could not fetch wishlist:', err);
      }
    } else {
      const localWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      setWishlist(localWishlist);
    }
  }, [isAuthenticated]);

  // Sync cart & wishlist on mount or auth change
  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, [refreshCart, refreshWishlist, isAuthenticated]);

  const extractErrorMessage = (err, fallback = 'An error occurred.') => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.data) {
      if (typeof err.data === 'string') return err.data;
      if (err.data.detail) return err.data.detail;
      if (err.data.error) return err.data.error;
      if (err.data.quantity && Array.isArray(err.data.quantity)) return err.data.quantity[0];
      if (err.data.product_id && Array.isArray(err.data.product_id)) return err.data.product_id[0];
      if (err.data.message) return err.data.message;
    }
    return err.message || fallback;
  };

  // Check if a product or specific variant is already in the current shopping cart
  const isInCart = (productId, variantId = null) => {
    if (!cart.items || cart.items.length === 0) return false;
    return cart.items.some((item) => {
      const prodMatch = (item.product?.id === productId || item.product_id === productId);
      if (!prodMatch) return false;
      if (variantId) {
        return (item.variant?.id === variantId || item.variant_id === variantId);
      }
      return true;
    });
  };

  // Add product or variant to cart with duplicate check & stock validation
  const addToCart = async (productId, quantity = 1, options = {}) => {
    const variantId = options.variantId || options.variant_id || null;

    // If product/variant is already in the cart, do not increment count; show 'Already added to cart' message
    if (isInCart(productId, variantId) && !options.forceAdd) {
      showToast('Already added to cart! You can manage quantity inside the cart.', 'info');
      return { success: false, alreadyInCart: true, message: 'Already added to cart' };
    }

    setIsLoading(true);
    try {
      const res = await addToCartApi(productId, quantity, sessionKey, variantId);
      if (res.cart) {
        setCart(res.cart);
      } else {
        await refreshCart();
      }
      showToast(res.message || 'Added product to cart!', 'success');
      return { success: true, message: res.message };
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to add item to cart.');
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(itemId);
    }

    try {
      const res = await updateCartItemApi(itemId, newQuantity, sessionKey);
      if (res.cart) {
        setCart(res.cart);
      } else {
        await refreshCart();
      }
      return { success: true };
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Could not update quantity.');
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }
  };

  // Remove single line item
  const removeFromCart = async (itemId) => {
    try {
      const res = await removeCartItemApi(itemId, sessionKey);
      if (res.cart) {
        setCart(res.cart);
      } else {
        await refreshCart();
      }
      showToast(res.message || 'Item removed from cart.', 'info');
      return { success: true };
    } catch (err) {
      showToast('Failed to remove item.', 'error');
    }
  };

  // Move line item to Wishlist and remove from Cart
  const moveToWishlist = async (itemId, product) => {
    setIsLoading(true);
    try {
      if (!isInWishlist(product.id)) {
        await toggleWishlist(product);
      }
      const res = await removeCartItemApi(itemId, sessionKey);
      if (res.cart) {
        setCart(res.cart);
      } else {
        await refreshCart();
      }
      showToast(`Moved '${product.name}' to Wishlist & removed from Cart!`, 'success');
      return { success: true };
    } catch (err) {
      showToast('Failed to move item to Wishlist.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const res = await clearCartApi(sessionKey);
      if (res.cart) {
        setCart(res.cart);
      } else {
        setCart({ items: [], total_items: 0, subtotal: '0.00', discount_total: '0.00', final_total: '0.00' });
      }
      showToast('Shopping cart cleared.', 'info');
    } catch (err) {
      showToast('Failed to clear cart.', 'error');
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    const productId = product.id;
    if (isAuthenticated) {
      try {
        const res = await toggleWishlistApi(productId);
        await refreshWishlist();
        showToast(res.message, res.in_wishlist ? 'success' : 'info');
        return res.in_wishlist;
      } catch (err) {
        showToast('Wishlist error', 'error');
      }
    } else {
      // Guest local wishlist
      let current = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      const exists = current.some((item) => (item.product?.id || item.id) === productId);

      if (exists) {
        current = current.filter((item) => (item.product?.id || item.id) !== productId);
        showToast(`Removed '${product.name}' from wishlist.`, 'info');
      } else {
        current.push({ id: Date.now(), product });
        showToast(`Added '${product.name}' to wishlist!`, 'success');
      }

      localStorage.setItem('guest_wishlist', JSON.stringify(current));
      setWishlist(current);
      return !exists;
    }
  };

  // Check if a product is in the current wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item.product?.id || item.id) === productId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      items: cart.items || [],
      totalItems: cart.total_items || 0,
      subtotal: cart.subtotal || '0.00',
      discountTotal: cart.discount_total || '0.00',
      finalTotal: cart.final_total || '0.00',
      isLoading,
      toastMessage,
      addToCart,
      updateQuantity,
      removeFromCart,
      moveToWishlist,
      clearCart,
      refreshCart,
      wishlist,
      wishlistCount: wishlist.length,
      toggleWishlist,
      isInWishlist,
      isInCart,
    }}>
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: toastMessage.type === 'error' ? '#f43f5e' : toastMessage.type === 'info' ? '#6366f1' : '#10b981',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <span>{toastMessage.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
