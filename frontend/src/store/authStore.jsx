// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       user: null,
//       isLoading: false,
//       error: null,
//       isAuthenticated: false,
//       isAdmin: false,

//       // Check authentication status on app load
//       checkAuth: () => {
//         const token = localStorage.getItem('token');
//         const userData = localStorage.getItem('userData');

//         if (token && userData) {
//           try {
//             const user = JSON.parse(userData);
//             set({
//               user,
//               isAuthenticated: true,
//               isAdmin: user.role === 'admin'
//             });
//           } catch (error) {
//             console.error('Error parsing user data:', error);
//             localStorage.removeItem('token');
//             localStorage.removeItem('userData');
//             set({ user: null, isAuthenticated: false, isAdmin: false });
//           }
//         }
//       },

//       // Login function
//       login: async (email, password, isAdminLogin = false) => {
//         set({ isLoading: true, error: null });

//         try {
//           const endpoint = isAdminLogin ? '/admin/login' : '/api/auth/login';
//           const response = await fetch(`http://localhost:3002${endpoint}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, password }),
//           });

//           const data = await response.json();

//           if (response.ok && data.success) {
//             localStorage.setItem('token', data.token);
//             localStorage.setItem('userData', JSON.stringify(data.user));
//             set({
//               user: data.user,
//               isLoading: false,
//               error: null,
//               isAuthenticated: true,
//               isAdmin: data.user.role === 'admin'
//             });
//             return { success: true };
//           } else {
//             set({ error: data.message || 'Login failed', isLoading: false });
//             return { success: false, error: data.message || 'Login failed' };
//           }
//         } catch (err) {
//           const error = 'Cannot connect to server. Please try again later.';
//           set({ error, isLoading: false });
//           return { success: false, error };
//         }
//       },

//       // Registration function
//       register: async (userData) => {
//         set({ isLoading: true, error: null });

//         try {
//           const response = await fetch('http://localhost:3002/api/auth/register', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(userData),
//           });

//           const data = await response.json();

//           if (response.ok && data.success) {
//             localStorage.setItem('token', data.token);
//             localStorage.setItem('userData', JSON.stringify(data.user));
//             set({
//               user: data.user,
//               isLoading: false,
//               error: null,
//               isAuthenticated: true,
//               isAdmin: data.user.role === 'admin'
//             });
//             return { success: true };
//           } else {
//             set({ error: data.message || 'Registration failed', isLoading: false });
//             return { success: false, error: data.message || 'Registration failed' };
//           }
//         } catch (err) {
//           const error = 'Cannot connect to server. Please try again later.';
//           set({ error, isLoading: false });
//           return { success: false, error };
//         }
//       },

//       logout: () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('userData');
//         set({
//           user: null,
//           error: null,
//           isAuthenticated: false,
//           isAdmin: false
//         });
//       },

//       clearError: () => set({ error: null }),
//     }),
//     { name: 'auth-storage' }
//   )
// );

// // Selectors / convenience hooks
// export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
// export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
// export const useAuthError = () => useAuthStore((state) => state.error);
// export const useIsAdmin = () => useAuthStore((state) => state.isAdmin);
// export const useUser = () => useAuthStore((state) => state.user);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isAdmin: false,

      // Check authentication status on app load
      checkAuth: () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            set({
              user,
              isAuthenticated: true,
              isAdmin: user.role === 'admin'
            });
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            set({ user: null, isAuthenticated: false, isAdmin: false });
          }
        }
      },

      // Login function
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            set({
              user: data.user,
              isLoading: false,
              error: null,
              isAuthenticated: true,
              isAdmin: data.user.role === 'admin'
            });
            return { success: true, user: data.user };
          } else {
            set({ error: data.message || 'Login failed', isLoading: false });
            return { success: false, error: data.message || 'Login failed' };
          }
        } catch (err) {
          const error = 'Cannot connect to server. Please try again later.';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      // Registration function
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('http://localhost:3002/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            set({
              user: data.user,
              isLoading: false,
              error: null,
              isAuthenticated: true,
              isAdmin: data.user.role === 'admin'
            });
            return { success: true, user: data.user };
          } else {
            set({ error: data.message || 'Registration failed', isLoading: false });
            return { success: false, error: data.message || 'Registration failed' };
          }
        } catch (err) {
          const error = 'Cannot connect to server. Please try again later.';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      // Logout function
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        set({
          user: null,
          error: null,
          isAuthenticated: false,
          isAdmin: false
        });
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'auth-storage' }
  )
);

// Convenience selectors
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin);
export const useUser = () => useAuthStore((state) => state.user);
