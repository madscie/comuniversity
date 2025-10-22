// src/config/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // For FormData, let the browser set the Content-Type
  if (options.body && options.body instanceof FormData) {
    delete config.headers['Content-Type'];
    config.body = options.body;
  } else if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`🔄 API Call: ${config.method} ${API_BASE}${url}`, options.body);
    
    const response = await fetch(`${API_BASE}${url}`, config);
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
      } catch (parseError) {
        const errorText = await response.text();
        console.error('❌ API Error Text:', errorText);
        errorData = { message: errorText || `HTTP error! status: ${response.status}` };
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Success Response:', data);
    return data;
  } catch (error) {
    console.error('💥 API Call Failed:', error);
    throw new Error(error.message || 'Network error');
  }
};

export const api = {
  // Admin - Books
  getDashboardStats: async () => {
    return apiCall('/admin/dashboard');
  },

  getAdminBooks: async () => {
    return apiCall('/admin/books');
  },

  // Books
  getBooks: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/books?${queryParams}` : '/books';
    return apiCall(url);
  },

  getBookById: async (id) => {
    return apiCall(`/books/${id}`);
  },

  createBook: async (bookData) => {
    return apiCall('/books', {
      method: 'POST',
      body: bookData
    });
  },

  updateBook: async (id, bookData) => {
    return apiCall(`/books/${id}`, {
      method: 'PUT',
      body: bookData
    });
  },

  deleteBook: async (id) => {
    return apiCall(`/books/${id}`, {
      method: 'DELETE'
    });
  },

  uploadBookCover: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return apiCall('/books/upload-cover', {
      method: 'POST',
      body: formData
    });
  },

  // Categories
  getCategories: async () => {
    return apiCall('/books/categories');
  },

  // Auth
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },

  // Test endpoint
  testConnection: async () => {
    return apiCall('/health');
  },

  // Articles - Admin
  getAdminArticles: async () => {
    return apiCall('/admin/articles');
  },

  createArticle: async (articleData) => {
    return apiCall('/admin/articles', {
      method: 'POST',
      body: articleData
    });
  },

  updateArticle: async (id, articleData) => {
    return apiCall(`/admin/articles/${id}`, {
      method: 'PUT',
      body: articleData
    });
  },

  deleteArticle: async (id) => {
    return apiCall(`/admin/articles/${id}`, {
      method: 'DELETE'
    });
  },

  uploadArticleImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCall('/admin/articles/upload-image', {
      method: 'POST',
      body: formData
    });
  },

  // Articles - Public
  getArticles: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/articles?${queryParams}` : '/articles';
    return apiCall(url);
  },

  getArticleById: async (id) => {
    return apiCall(`/articles/${id}`);
  },

  getArticleCategories: async () => {
    return apiCall('/articles/categories');
  }
};