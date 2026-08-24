import apiClient from './api';

export const getHealthStatus = async () => {
  const response = await apiClient.get('/health/');
  return response.data;
};

export default {
  getHealthStatus,
};
