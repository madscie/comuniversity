// // store/authStore.js
// import { create } from "zustand";
// import { api } from "../config/api";

// export const useAuthStore = create((set, get) => ({
//   user: null,
//   isAuthenticated: false,
//   isLoading: false,
//   hasCheckedAuth: false,
//   isAdmin: false,

//   // Regular login (used for both users and admins)
//   login: async (email, password) => {
//     set({ isLoading: true });

//     try {
//       console.log('🔐 Attempting login with:', { email });
      
//       // Use the regular login endpoint
//       const response = await api.login(email, password);
//       console.log('📥 Login response:', response);
      
//       if (response.success) {
//         const { user, token } = response.data;
        
//         // Store token and user data
//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(user));

//         const isAdmin = user.role === 'admin';

//         set({
//           user,
//           isAuthenticated: true,
//           isAdmin: isAdmin,
//           isLoading: false,
//           hasCheckedAuth: true,
//         });

//         return { 
//           success: true, 
//           user,
//           isAdmin 
//         };
//       } else {
//         throw new Error(response.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('❌ Login error:', error);
//       set({
//         user: null,
//         isAuthenticated: false,
//         isAdmin: false,
//         isLoading: false,
//         hasCheckedAuth: true,
//       });
//       return { 
//         success: false, 
//         error: error.message || 'Login failed. Please check your credentials.' 
//       };
//     }
//   },

//   // Admin login - uses regular login but checks for admin role
//   adminLogin: async (email, password) => {
//     set({ isLoading: true });

//     try {
//       console.log('🛡️ Attempting admin login with:', { email });
      
//       // Use the regular login endpoint
//       const response = await api.login(email, password);
//       console.log('📥 Admin login response:', response);
      
//       if (response.success) {
//         const { user, token } = response.data;
        
//         // Check if user is actually an admin
//         if (user.role !== 'admin') {
//           throw new Error('Access denied. Admin privileges required.');
//         }
        
//         // Store token and user data
//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(user));

//         set({
//           user,
//           isAuthenticated: true,
//           isAdmin: true,
//           isLoading: false,
//           hasCheckedAuth: true,
//         });

//         return { 
//           success: true, 
//           user,
//           isAdmin: true 
//         };
//       } else {
//         throw new Error(response.message || 'Admin login failed');
//       }
//     } catch (error) {
//       console.error('❌ Admin login error:', error);
//       set({
//         user: null,
//         isAuthenticated: false,
//         isAdmin: false,
//         isLoading: false,
//         hasCheckedAuth: true,
//       });
//       return { 
//         success: false, 
//         error: error.message || 'Admin login failed. Please check your credentials.' 
//       };
//     }
//   },

//   // Development bypass - for testing without real login
//   devLogin: async () => {
//     const mockAdminUser = {
//       id: 1,
//       name: 'Admin User',
//       email: 'admin@communiversity.com',
//       role: 'admin',
//       avatar_url: null
//     };

//     localStorage.setItem('user', JSON.stringify(mockAdminUser));
    
//     set({
//       user: mockAdminUser,
//       isAuthenticated: true,
//       isAdmin: true,
//       isLoading: false,
//       hasCheckedAuth: true,
//     });

//     return { 
//       success: true, 
//       user: mockAdminUser,
//       isAdmin: true 
//     };
//   },

//   logout: () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     set({
//       user: null,
//       isAuthenticated: false,
//       isAdmin: false,
//       isLoading: false,
//       hasCheckedAuth: true,
//     });
//   },

//   checkAuth: async () => {
//     const state = get();
//     if (state.isLoading) return;

//     set({ isLoading: true });

//     try {
//       const token = localStorage.getItem('token');
//       const storedUser = localStorage.getItem('user');
      
//       if (!token || !storedUser) {
//         set({
//           user: null,
//           isAuthenticated: false,
//           isAdmin: false,
//           hasCheckedAuth: true,
//           isLoading: false,
//         });
//         return;
//       }

//       // Try to get current user from API
//       try {
//         const response = await api.getCurrentUser();
        
//         if (response.success) {
//           const user = response.data.user;
//           const isAdmin = user.role === 'admin';
          
//           set({
//             user,
//             isAuthenticated: true,
//             isAdmin: isAdmin,
//             hasCheckedAuth: true,
//             isLoading: false,
//           });
//         } else {
//           throw new Error('Invalid token');
//         }
//       } catch (apiError) {
//         // If API call fails, use stored user but mark as needs refresh
//         console.warn('Auth check API failed, using stored user:', apiError);
//         const user = JSON.parse(storedUser);
//         const isAdmin = user.role === 'admin';
        
//         set({
//           user,
//           isAuthenticated: true,
//           isAdmin: isAdmin,
//           hasCheckedAuth: true,
//           isLoading: false,
//         });
//       }
//     } catch (error) {
//       console.error('Auth check error:', error);
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       set({
//         user: null,
//         isAuthenticated: false,
//         isAdmin: false,
//         hasCheckedAuth: true,
//         isLoading: false,
//       });
//     }
//   },
// }));



import { create } from 'zustand';
import { useUser, useAuth } from '@clerk/clerk-react';

// Create a custom hook that syncs Clerk state with your app
export const useClerkAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  hasCheckedAuth: true,
  
  // Initialize auth state from Clerk
  initializeAuth: () => {
    // This would be called in components that need the auth state
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    
    if (isLoaded && isSignedIn && user) {
      set({
        user: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          imageUrl: user.imageUrl,
          isAffiliate: user.publicMetadata?.isAffiliate || false,
          affiliateStatus: user.publicMetadata?.affiliateStatus || 'not_applied',
          role: user.publicMetadata?.role || 'user',
        },
        isAuthenticated: true,
        isAdmin: user.publicMetadata?.role === 'admin',
      });
    } else if (isLoaded) {
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  },

  logout: () => {
    const { signOut } = useAuth();
    signOut();
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  checkAuth: () => {
    get().initializeAuth();
  },
}));

// Export as useAuthStore for compatibility with existing code
export const useAuthStore = useClerkAuthStore;