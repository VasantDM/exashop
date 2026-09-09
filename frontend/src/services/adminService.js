import apiClient from './api';

export const getAdminDashboard = async () => {
  const response = await apiClient.get('/admin/dashboard/');
  return response.data;
};

// 1. Products Management
export const getAdminProducts = async (params = {}) => {
  const response = await apiClient.get('/admin/products/', { params });
  return response.data;
};

export const createAdminProduct = async (productData) => {
  const response = await apiClient.post('/admin/products/', productData);
  return response.data;
};

export const updateAdminProduct = async (id, productData) => {
  const response = await apiClient.patch(`/admin/products/${id}/`, productData);
  return response.data;
};

export const deleteAdminProduct = async (id) => {
  const response = await apiClient.delete(`/admin/products/${id}/`);
  return response.data;
};

export const addAdminProductVariant = async (productId, variantData) => {
  const response = await apiClient.post(`/admin/products/${productId}/variants/`, variantData);
  return response.data;
};

export const deleteAdminProductVariant = async (variantId) => {
  const response = await apiClient.delete(`/admin/products/variants/${variantId}/`);
  return response.data;
};

export const addAdminProductImage = async (productId, imageData) => {
  const response = await apiClient.post(`/admin/products/${productId}/images/`, imageData);
  return response.data;
};

export const deleteAdminProductImage = async (imageId) => {
  const response = await apiClient.delete(`/admin/products/images/${imageId}/`);
  return response.data;
};

export const setAdminProductImagePrimary = async (imageId) => {
  const response = await apiClient.patch(`/admin/products/images/${imageId}/primary/`);
  return response.data;
};

// 2. Categories Management
export const getAdminCategories = async () => {
  const response = await apiClient.get('/admin/categories/');
  return response.data;
};

export const createAdminCategory = async (categoryData) => {
  const response = await apiClient.post('/admin/categories/', categoryData);
  return response.data;
};

export const updateAdminCategory = async (id, categoryData) => {
  const response = await apiClient.patch(`/admin/categories/${id}/`, categoryData);
  return response.data;
};

export const deleteAdminCategory = async (id) => {
  const response = await apiClient.delete(`/admin/categories/${id}/`);
  return response.data;
};

// 3. Orders Management
export const getAdminOrders = async (params = {}) => {
  const response = await apiClient.get('/admin/orders/', { params });
  return response.data;
};

export const getAdminOrderDetail = async (orderNumber) => {
  const response = await apiClient.get(`/admin/orders/${orderNumber}/`);
  return response.data;
};

export const updateAdminOrderStatus = async (orderNumber, statusData) => {
  const response = await apiClient.patch(`/admin/orders/${orderNumber}/status/`, statusData);
  return response.data;
};

// 4. Customers & Users Management
export const getAdminCustomers = async (params = {}) => {
  const response = await apiClient.get('/admin/customers/', { params });
  return response.data;
};

export const getAdminUsers = getAdminCustomers;

export const createAdminUser = async (userData) => {
  const response = await apiClient.post('/admin/customers/', userData);
  return response.data;
};

export const updateAdminUser = async (id, userData) => {
  const response = await apiClient.patch(`/admin/customers/${id}/`, userData);
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await apiClient.delete(`/admin/customers/${id}/`);
  return response.data;
};

export const toggleAdminCustomerActive = async (id) => {
  const response = await apiClient.patch(`/admin/customers/${id}/toggle-active/`);
  return response.data;
};

// 5. Inventory Management
export const getAdminInventory = async (params = {}) => {
  const response = await apiClient.get('/admin/inventory/', { params });
  return response.data;
};

export const quickUpdateAdminStock = async (payload) => {
  const response = await apiClient.post('/admin/inventory/update-stock/', payload);
  return response.data;
};

export default {
  getAdminDashboard,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  addAdminProductVariant,
  deleteAdminProductVariant,
  addAdminProductImage,
  deleteAdminProductImage,
  setAdminProductImagePrimary,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  getAdminCustomers,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminCustomerActive,
  getAdminInventory,
  quickUpdateAdminStock,
};
