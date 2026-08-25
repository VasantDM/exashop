import apiClient from './api';

// Helper to pass session key header for guest carts
const getSessionHeader = (sessionKey) => {
  return sessionKey ? { headers: { 'X-Session-Key': sessionKey } } : {};
};

export const getCart = async (sessionKey) => {
  const response = await apiClient.get('/cart/', getSessionHeader(sessionKey));
  return response.data;
};

export const addToCart = async (productId, quantity = 1, sessionKey, variantId = null) => {
  const payload = { product_id: productId, quantity };
  if (variantId) {
    payload.variant_id = variantId;
  }
  const response = await apiClient.post(
    '/cart/items/',
    payload,
    getSessionHeader(sessionKey)
  );
  return response.data;
};

export const updateCartItem = async (itemId, quantity, sessionKey) => {
  const response = await apiClient.patch(
    `/cart/items/${itemId}/`,
    { quantity },
    getSessionHeader(sessionKey)
  );
  return response.data;
};

export const removeCartItem = async (itemId, sessionKey) => {
  const response = await apiClient.delete(
    `/cart/items/${itemId}/remove/`,
    getSessionHeader(sessionKey)
  );
  return response.data;
};

export const clearCart = async (sessionKey) => {
  const response = await apiClient.delete(
    '/cart/clear/',
    getSessionHeader(sessionKey)
  );
  return response.data;
};

export const getWishlist = async () => {
  const response = await apiClient.get('/cart/wishlist/');
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await apiClient.post('/cart/wishlist/', { product_id: productId });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await apiClient.delete(`/cart/wishlist/${productId}/`);
  return response.data;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
};
