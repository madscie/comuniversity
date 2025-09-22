import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // State
  isAuthenticated: false,
  user: null,
  isAdmin: false,
  isLoading: true,
  error: null,

  // ✅ Check authentication status on app load
  checkAuth: () => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const storedIsAdmin = JSON.parse(localStorage.getItem("isAdmin") || "false");

    if (token && storedUser) {
      set({
        isAuthenticated: true,
        user: storedUser,
        isAdmin: storedIsAdmin,
        isLoading: false,
      });
    } else {
      set({ isAuthenticated: false, user: null, isAdmin: false, isLoading: false });
    }
  },

  // Regular user login
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAdmin", JSON.stringify(false));

      set({
        isAuthenticated: true,
        user: data.user,
        isAdmin: false,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // ✅ Admin login
  adminLogin: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch("http://localhost:3002/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Admin login failed");

      // ✅ Use "user" for compatibility, but explicitly save admin flag
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAdmin", JSON.stringify(true));

      set({
        isAuthenticated: true,
        user: data.user,
        isAdmin: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    set({ isAuthenticated: false, user: null, isAdmin: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
