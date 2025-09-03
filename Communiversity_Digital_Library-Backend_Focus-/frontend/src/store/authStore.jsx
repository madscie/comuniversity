// src/store/authStore.js
import { create } from "zustand";

// Central state management for authentication
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Mock login function for now. Replace with API call later.
  login: async (credentials) => {
    // TODO: Replace with real API call
    console.log("Attempting login with:", credentials);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful login
    if (
      credentials.username === "admin" &&
      credentials.password === "password"
    ) {
      const userData = { name: "Librarian Admin", isAdmin: true };
      set({ user: userData, isAuthenticated: true });
      return { success: true };
    } else {
      return { success: false, error: "Invalid credentials" };
    }
  },

  logout: () => set({ user: null, isAuthenticated: false }),
}));
