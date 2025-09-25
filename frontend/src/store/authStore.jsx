import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dynamic role assignment based on email
      const isAdmin = email.includes('admin') || email === 'admin@example.com';
      const userRole = isAdmin ? 'admin' : 'user';
      
      // Extract name from email for more personalized greeting
      const emailName = email.split('@')[0];
      const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      
      const userData = {
        id: 1,
        name: isAdmin ? "Admin User" : formattedName,
        email: email,
        isAdmin: isAdmin,
        role: userRole,
        joinDate: new Date().toISOString()
      };

      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true, user: userData };
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
    localStorage.removeItem("user");
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      set({ user, isAuthenticated: true });
    }
  },
}));


