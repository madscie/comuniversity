import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password, isAdmin = false) => {
    set({ isLoading: true });

    try {
      const url = isAdmin
        ? "http://localhost:5000/api/admin/login"
        : "http://localhost:5000/api/auth/login";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.message || "Login failed");

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      return { success: true, user: data.user };

    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      set({ user, isAuthenticated: true });
    }
  },
}));
