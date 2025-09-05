// src/store/authStore.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });

    // Simulate API call
    try {
      // In a real app, you would call your API here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      set({
        user: {
          id: 1,
          name: "Admin User",
          email: email,
          isAdmin: true,
        },
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    // Check if user is already authenticated (e.g., from localStorage)
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      set({ user, isAuthenticated: true });
    }
  },
}));
