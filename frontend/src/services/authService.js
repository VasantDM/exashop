import apiClient from './api';

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register/', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login/', credentials);
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/users/profile/');
  return response.data;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
