// store/authStore.js
import { create } from "zustand";
import { api } from "../config/api"; // Fixed import path

// Define API_BASE here since we can't import from api.js in a circular dependency
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasCheckedAuth: false,

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      console.log('Attempting login with:', { email });
      const response = await api.login(email, password);
      console.log('Login response:', response);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          hasCheckedAuth: true,
        });

        return { success: true, user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  },

  signup: async (userData) => {
    set({ isLoading: true });

    try {
      console.log('Attempting signup with:', userData);
      const response = await api.register(userData);
      console.log('Signup response:', response);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          hasCheckedAuth: true,
        });

        return {
          success: true,
          message: "Account created successfully!",
          user
        };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  },

  adminLogin: async (email, password) => {
    set({ isLoading: true });

    try {
      const response = await apiCall(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        body: { email, password }
      });
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          hasCheckedAuth: true,
        });

        return { success: true, user };
      } else {
        throw new Error(response.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
      return { success: false, error: error.message };
    }
  },

  // ... rest of your authStore functions remain the same
  // (updateReferralStatus, trackReferral, etc.)

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminUser");
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCheckedAuth: true,
    });
  },

  checkAuth: async () => {
    const state = get();
    if (state.isLoading) return;

    set({ isLoading: true });

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        set({
          user: null,
          isAuthenticated: false,
          hasCheckedAuth: true,
          isLoading: false,
        });
        return;
      }

      // Try to get current user from API
      try {
        const response = await api.getCurrentUser();
        
        if (response.success) {
          const user = response.data.user;
          set({
            user,
            isAuthenticated: true,
            hasCheckedAuth: true,
            isLoading: false,
          });
        } else {
          throw new Error('Invalid token');
        }
      } catch (apiError) {
        // If API call fails, use stored user but mark as needs refresh
        console.warn('Auth check API failed, using stored user:', apiError);
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          hasCheckedAuth: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false,
        hasCheckedAuth: true,
        isLoading: false,
      });
    }
  },
}));

// Helper function for API calls in this file
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};