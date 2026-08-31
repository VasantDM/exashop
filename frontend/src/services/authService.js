import apiClient from './api';

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register/', userData);
  if (response.data.tokens) {
    localStorage.setItem('access_token', response.data.tokens.access);
    localStorage.setItem('refresh_token', response.data.tokens.refresh);
  }
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

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  try {
    if (refreshToken) {
      await apiClient.post('/auth/logout/', { refresh: refreshToken });
    }
  } catch (err) {
    console.warn('Logout API warning:', err);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/users/profile/');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.patch('/users/profile/', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await apiClient.post('/users/change-password/', passwordData);
  return response.data;
};

export const getAddresses = async () => {
  const response = await apiClient.get('/users/addresses/');
  return response.data.results || response.data;
};

export const createAddress = async (addressData) => {
  const response = await apiClient.post('/users/addresses/', addressData);
  return response.data;
};

export const updateAddress = async (id, addressData) => {
  const response = await apiClient.patch(`/users/addresses/${id}/`, addressData);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await apiClient.delete(`/users/addresses/${id}/`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await apiClient.get('/users/admin/all/');
  return response.data.results || response.data;
};

export const sendPasswordResetOTP = async (email) => {
  const response = await apiClient.post('/auth/password-reset/send-otp/', { email });
  return response.data;
};

export const validatePasswordResetOTP = async ({ email, otp }) => {
  const response = await apiClient.post('/auth/password-reset/validate-otp/', { email, otp });
  return response.data;
};

export const verifyPasswordResetOTP = async ({ email, otp, new_password, confirm_password }) => {
  const response = await apiClient.post('/auth/password-reset/verify-otp/', {
    email,
    otp,
    new_password,
    confirm_password,
  });
  return response.data;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  sendPasswordResetOTP,
  validatePasswordResetOTP,
  verifyPasswordResetOTP,
};
