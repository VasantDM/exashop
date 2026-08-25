import apiClient from './api';

export const createOrder = async (orderPayload) => {
  const response = await apiClient.post('/orders/create/', orderPayload);
  return response.data;
};

export const getOrders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/orders/?${query}` : '/orders/';
  const response = await apiClient.get(url);
  return response.data;
};

export const getOrderDetails = async (orderNumber) => {
  const response = await apiClient.get(`/orders/${orderNumber}/`);
  return response.data;
};

export const cancelOrder = async (orderNumber) => {
  const response = await apiClient.post(`/orders/${orderNumber}/cancel/`);
  return response.data;
};

export default {
  createOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
};
