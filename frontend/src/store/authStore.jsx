import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasCheckedAuth: false,

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0],
        email: email,
        role: "user",
        isAdmin: false,
      };

      // Clear sessions and set new user session
      localStorage.removeItem("adminUser");
      localStorage.setItem("user", JSON.stringify(userData));

      // IMPORTANT: Update the state directly instead of relying on checkAuth
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true, // ← Set this to true
      });

      return { success: true };
    } catch (error) {
      // ... error handling
    }
  },
  adminLogin: async (email, password) => {
    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@communiversity.com" && password === "admin123") {
        const adminData = {
          id: 1,
          name: "Admin User",
          email: email,
          role: "admin",
          isAdmin: true,
        };

        localStorage.removeItem("user");
        localStorage.setItem("adminUser", JSON.stringify(adminData));

        set({
          user: adminData,
          isAuthenticated: true,
          isLoading: false,
          hasCheckedAuth: true,
        });

        return { success: true };
      } else {
        throw new Error("Invalid admin credentials");
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("adminUser");
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCheckedAuth: true,
    });
  },

// In your auth store, modify the checkAuth function
checkAuth: () => {
  const state = get();

  // Prevent multiple simultaneous checks
  if (state.isLoading) return;

  set({ isLoading: true });

  // Add a small delay to prevent rapid state changes
  setTimeout(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedAdmin = localStorage.getItem("adminUser");

      // Clear conflict: if both exist, prefer regular user
      if (storedUser && storedAdmin) {
        localStorage.removeItem("adminUser");
      }

      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          hasCheckedAuth: true,
          isLoading: false,
        });
        return;
      }

      if (storedAdmin) {
        const user = JSON.parse(storedAdmin);
        set({
          user,
          isAuthenticated: true,
          hasCheckedAuth: true,
          isLoading: false,
        });
        return;
      }

      // No session found
      set({
        user: null,
        isAuthenticated: false,
        hasCheckedAuth: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("adminUser");
      set({
        user: null,
        isAuthenticated: false,
        hasCheckedAuth: true,
        isLoading: false,
      });
    }
  }, 100); // 100ms delay
},
}));
