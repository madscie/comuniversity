import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password, isAdmin = false) => {
    set({ isLoading: true });

    try {
      console.log('🔐 Attempting login:', { email, isAdmin });
      
      // TEMPORARY FIX: Always use the regular login endpoint
      // Remove the admin endpoint until it's created in backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🔐 Login response:', data);

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Check if user has admin role (you'll need to add this to your backend)
      // For now, we'll detect admin based on email pattern on frontend
      const userEmail = data.user.email.toLowerCase();
      const userIsAdmin = userEmail.includes('admin') || 
                          userEmail.includes('administrator') || 
                          userEmail.endsWith('@communiversity.org');

      // Ensure user object has profilePicture field and admin flag
      const userWithProfile = {
        ...data.user,
        profilePicture: data.user.profilePicture || null,
        isAdmin: userIsAdmin // Temporary frontend detection
      };

      set({
        user: userWithProfile,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("user", JSON.stringify(userWithProfile));
      localStorage.setItem("token", data.token);

      console.log('✅ Login successful:', { 
        user: userWithProfile, 
        isAdmin: userIsAdmin 
      });
      
      return { 
        success: true, 
        user: userWithProfile,
        isAdmin: userIsAdmin
      };

    } catch (err) {
      console.error('❌ Login failed:', err);
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    console.log('🔍 checkAuth - Stored data:', { 
      hasUser: !!storedUser, 
      hasToken: !!storedToken 
    });

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        console.log('✅ checkAuth - User found:', user);
        set({ user, isAuthenticated: true });
      } catch (error) {
        console.error('❌ checkAuth - Error parsing user:', error);
        set({ user: null, isAuthenticated: false });
      }
    } else {
      console.log('❌ checkAuth - No stored authentication data');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUserProfile: (updatedUser) => {
    console.log('🔄 Updating user profile:', updatedUser);
    set({ user: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
  },
}));