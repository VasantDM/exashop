import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  updateProfile as updateProfileApi 
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
      setIsAuthenticated(true);
      return profile;
    } catch (err) {
      console.warn('Could not fetch user profile with current token:', err);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetchUserProfile();
      }
      setLoading(false);
    };

    initializeAuth();
  }, [fetchUserProfile]);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await loginUser(credentials);
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        await fetchUserProfile();
      }
      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = err.data?.detail || 
                       err.data?.non_field_errors?.[0] || 
                       err.data?.message || 
                       'Invalid login credentials. Please check your email/username and password.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const data = await registerUser(userData);
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        await fetchUserProfile();
      }
      return { success: true, user: data.user };
    } catch (err) {
      let errorMsg = 'Registration failed. Please check your form input.';
      if (err.data) {
        if (err.data.email) errorMsg = Array.isArray(err.data.email) ? err.data.email[0] : err.data.email;
        else if (err.data.username) errorMsg = Array.isArray(err.data.username) ? err.data.username[0] : err.data.username;
        else if (err.data.confirm_password) errorMsg = Array.isArray(err.data.confirm_password) ? err.data.confirm_password[0] : err.data.confirm_password;
        else if (err.data.password) errorMsg = Array.isArray(err.data.password) ? err.data.password[0] : err.data.password;
        else if (err.data.detail) errorMsg = err.data.detail;
      }
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await updateProfileApi(profileData);
      setUser((prev) => ({ ...prev, ...updated }));
      return { success: true, user: updated };
    } catch (err) {
      const errorMsg = err.data?.message || 'Failed to update profile.';
      throw new Error(errorMsg);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.is_staff || false;
  const isCustomer = user?.role === 'customer' || false;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      authError,
      setAuthError,
      login,
      register,
      logout,
      updateProfile,
      fetchUserProfile,
      isAdmin,
      isCustomer,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
