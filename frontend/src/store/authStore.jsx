// // src/store/authStore.js
// import { create } from 'zustand';

// export const useAuthStore = create((set, get) => ({
//   user: null,
//   isLoading: false,
//   error: null,

//   // Getter for authentication status
//   get isAuthenticated() {
//     return !!get().user;
//   },

//   checkAuth: () => {
//     const token = localStorage.getItem('adminToken');
//     const userData = localStorage.getItem('adminUser');
    
//     if (token && userData) {
//       try {
//         const user = JSON.parse(userData);
//         set({ user });
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//         localStorage.removeItem('adminToken');
//         localStorage.removeItem('adminUser');
//       }
//     }
//   },

//   login: async (email, password) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       const response = await fetch('http://localhost:3002/admin/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('adminToken', data.token);
//         localStorage.setItem('adminUser', JSON.stringify(data.user));
//         set({ user: data.user, isLoading: false, error: null });
//         return { success: true };
//       } else {
//         set({ error: data.message, isLoading: false });
//         return { success: false, error: data.message };
//       }
//     } catch (err) {
//       const error = 'Cannot connect to server. Please try again later.';
//       set({ error, isLoading: false });
//       return { success: false, error };
//     }
//   },

//   logout: () => {
//     localStorage.removeItem('adminToken');
//     localStorage.removeItem('adminUser');
//     set({ user: null, error: null });
//   },

//   clearError: () => set({ error: null })
// }));

// // Authentication selector
// export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);







// src/store/authStore.js
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

      // User login function
      login: async (email, password, isUserLogin = true) => {
        set({ isLoading: true, error: null });
        
        try {
          const endpoint = isUserLogin ? '/api/auth/login' : '/admin/login';
          const response = await fetch(`http://localhost:3002${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
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

      // User registration function
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:3002/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
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
              isAdmin: false
            });
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
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        set({ 
          user: null, 
          error: null, 
          isAuthenticated: false, 
          isAdmin: false 
        });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Authentication selector
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);