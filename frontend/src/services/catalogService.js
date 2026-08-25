import apiClient from './api';

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();
  
  if (params.page) query.append('page', params.page);
  if (params.search) query.append('search', params.search);
  if (params.category) query.append('category', params.category);
  if (params.brand) query.append('brand', params.brand);
  if (params.min_price) query.append('min_price', params.min_price);
  if (params.max_price) query.append('max_price', params.max_price);
  if (params.in_stock) query.append('in_stock', 'true');
  if (params.featured) query.append('featured', 'true');
  if (params.ordering) query.append('ordering', params.ordering);

  const queryString = query.toString();
  const url = queryString ? `/products/?${queryString}` : '/products/';
  const response = await apiClient.get(url);
  return response.data;
};

export const getProductBySlugOrId = async (slugOrId) => {
  const response = await apiClient.get(`/products/${slugOrId}/`);
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await apiClient.get('/products/featured/');
  return response.data.results || response.data;
};

export const getCategories = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/categories/?${query}` : '/categories/';
  const response = await apiClient.get(url);
  return response.data.results || response.data;
};

export const getBrands = async () => {
  const response = await apiClient.get('/products/brands/');
  return response.data.results || response.data;
};

export default {
  getProducts,
  getProductBySlugOrId,
  getFeaturedProducts,
  getCategories,
  getBrands,
};
