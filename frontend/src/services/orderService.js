import apiClient from './api';

const orderCache = new Map();
const TTL_ORDERS = 60 * 1000; // 1 minute

const getFromCache = (key, maxAge = TTL_ORDERS) => {
  const entry = orderCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAge) return null;
  return entry.data;
};

const setInCache = (key, data) => {
  orderCache.set(key, { data, timestamp: Date.now() });
};

export const createOrder = async (orderPayload) => {
  orderCache.clear();
  const response = await apiClient.post('/orders/create/', orderPayload);
  return response.data;
};

export const getOrders = async (params = {}, options = {}) => {
  const query = new URLSearchParams(params).toString();
  const cacheKey = `orders:${query}`;
  
  if (!options.forceRefresh) {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  }

  const url = query ? `/orders/?${query}` : '/orders/';
  const response = await apiClient.get(url);
  setInCache(cacheKey, response.data);
  return response.data;
};

export const getCachedOrders = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return getFromCache(`orders:${query}`);
};

export const getOrderDetails = async (orderNumber, options = {}) => {
  const cacheKey = `order_detail:${orderNumber}`;
  
  if (!options.forceRefresh) {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  }

  const response = await apiClient.get(`/orders/${orderNumber}/`);
  setInCache(cacheKey, response.data);
  return response.data;
};

export const getCachedOrderDetails = (orderNumber) => {
  return getFromCache(`order_detail:${orderNumber}`);
};

export const cancelOrder = async (orderNumber) => {
  orderCache.clear();
  const response = await apiClient.post(`/orders/${orderNumber}/cancel/`);
  return response.data;
};

export default {
  createOrder,
  getOrders,
  getCachedOrders,
  getOrderDetails,
  getCachedOrderDetails,
  cancelOrder,
};
