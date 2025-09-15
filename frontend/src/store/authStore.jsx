// src/store/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  // Getter for authentication status
  get isAuthenticated() {
    return !!get().user;
  },

  checkAuth: () => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({ user });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('http://localhost:3002/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        set({ user: data.user, isLoading: false, error: null });
        return { success: true };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, error: data.message };
      }
    } catch (err) {
      const error = 'Cannot connect to server. Please try again later.';
      set({ error, isLoading: false });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null })
}));

// Authentication selector
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);