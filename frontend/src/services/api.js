import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      data: error.response?.data || { message: 'Network or Server Error' },
      message: error.message || 'An unexpected error occurred',
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
