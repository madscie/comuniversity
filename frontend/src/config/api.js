import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔄 API Call:', config.method?.toUpperCase(), config.url, config.data || '');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Success Response:', response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// Helper function for FormData creation
const createArticleFormData = (articleData) => {
  const formData = new FormData();
  
  // Append all article data
  Object.keys(articleData).forEach(key => {
    if (key !== 'imageFile' && key !== 'documentFile') {
      // Convert boolean to string for FormData
      const value = typeof articleData[key] === 'boolean' 
        ? articleData[key].toString() 
        : articleData[key];
      formData.append(key, value);
    }
  });
  
  // Append image file if exists
  if (articleData.imageFile) {
    formData.append('image', articleData.imageFile);
  }
  
  // Append document file if exists
  if (articleData.documentFile) {
    formData.append('document', articleData.documentFile);
  }
  
  // Log FormData contents for debugging
  console.log('📦 FormData entries:');
  for (let pair of formData.entries()) {
    console.log('  ', pair[0], ':', pair[1]);
  }
  
  return formData;
};

// ===== MAIN API OBJECT =====
export const api = {
  // ===== ADMIN - DASHBOARD =====
  getDashboardStats: async () => {
    return axiosInstance.get('/admin/dashboard');
  },

  // ===== ADMIN - BOOKS =====
  getAdminBooks: async () => {
    return axiosInstance.get('/admin/books');
  },

  createBook: async (bookData) => {
    return axiosInstance.post('/admin/books', bookData);
  },

  updateBook: async (id, bookData) => {
    return axiosInstance.put(`/admin/books/${id}`, bookData);
  },

  deleteBook: async (id) => {
    return axiosInstance.delete(`/admin/books/${id}`);
  },

  uploadBookCover: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return axiosInstance.post('/books/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // ===== BOOKS - PUBLIC =====
  getBooks: async (params = {}) => {
    return axiosInstance.get('/books', { params });
  },

  getBookById: async (id) => {
    return axiosInstance.get(`/books/${id}`);
  },

  getCategories: async () => {
    return axiosInstance.get('/books/categories');
  },

  // ===== ADMIN - ARTICLES =====
  getAdminArticles: async () => {
    return axiosInstance.get('/admin/articles');
  },

  createArticle: async (articleData) => {
    const formData = createArticleFormData(articleData);
    console.log('🆕 Creating new article');
    return axiosInstance.post('/admin/articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateArticle: async (id, articleData) => {
    const formData = createArticleFormData(articleData);
    console.log(`🔄 Updating article with ID: ${id}`);
    return axiosInstance.put(`/admin/articles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteArticle: async (id) => {
    return axiosInstance.delete(`/admin/articles/${id}`);
  },

  uploadArticleImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post('/admin/articles/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadArticleDocument: async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return axiosInstance.post('/admin/articles/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // ===== ARTICLES - PUBLIC =====
  getArticles: async (params = {}) => {
    return axiosInstance.get('/articles', { params });
  },

  getArticleById: async (id) => {
    return axiosInstance.get(`/articles/${id}`);
  },

  getArticleCategories: async () => {
    return axiosInstance.get('/articles/categories');
  },

  getFeaturedArticles: async () => {
    return axiosInstance.get('/articles/featured/all');
  },

  // ===== ADMIN - WEBINARS =====
  getAdminWebinars: async () => {
    return axiosInstance.get('/admin/webinars');
  },

  createWebinar: async (webinarData) => {
    return axiosInstance.post('/admin/webinars', webinarData);
  },

  updateWebinar: async (id, webinarData) => {
    return axiosInstance.put(`/admin/webinars/${id}`, webinarData);
  },

  deleteWebinar: async (id) => {
    return axiosInstance.delete(`/admin/webinars/${id}`);
  },

  uploadWebinarImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post('/admin/webinars/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // ===== WEBINARS - PUBLIC =====
  getWebinars: async (params = {}) => {
    return axiosInstance.get('/webinars', { params });
  },

  getWebinarById: async (id) => {
    return axiosInstance.get(`/webinars/${id}`);
  },

  getWebinarCategories: async () => {
    return axiosInstance.get('/webinars/categories');
  },

  getFeaturedWebinars: async () => {
    return axiosInstance.get('/webinars/featured/all');
  },

  registerForWebinar: async (webinarId, userData) => {
    return axiosInstance.post(`/webinars/${webinarId}/register`, userData);
  },

  // ===== AUTH =====
  login: async (email, password) => {
    return axiosInstance.post('/auth/login', { email, password });
  },

  register: async (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },

  getCurrentUser: async () => {
    return axiosInstance.get('/auth/me');
  },

  // ===== USERS =====
  getUsers: async () => {
    return axiosInstance.get('/admin/users');
  },

  updateUser: async (id, userData) => {
    return axiosInstance.put(`/admin/users/${id}`, userData);
  },

  // ===== AFFILIATES =====
  getAffiliates: async () => {
    return axiosInstance.get('/admin/affiliates');
  },

  updateAffiliateStatus: async (id, statusData) => {
    return axiosInstance.put(`/admin/affiliates/${id}/status`, statusData);
  },

  // ===== TEST ENDPOINTS =====
  testConnection: async () => {
    return axiosInstance.get('/health');
  },

  getStatus: async () => {
    return axiosInstance.get('/status');
  },

  testDatabase: async () => {
    return axiosInstance.get('/db-test');
  }
};

// ===== SPECIFIC API MODULES =====
export const authAPI = {
  login: (email, password) => api.login(email, password),
  register: (userData) => api.register(userData),
  getCurrentUser: () => api.getCurrentUser(),
};

export const adminAPI = {
  getDashboardStats: () => api.getDashboardStats(),
  getUsers: () => api.getUsers(),
  updateUser: (id, userData) => api.updateUser(id, userData),
  getAffiliates: () => api.getAffiliates(),
  updateAffiliateStatus: (id, statusData) => api.updateAffiliateStatus(id, statusData),
  getAdminArticles: () => api.getAdminArticles(),
  createArticle: (articleData) => api.createArticle(articleData),
  updateArticle: (id, articleData) => api.updateArticle(id, articleData),
  deleteArticle: (id) => api.deleteArticle(id),
  getAdminBooks: () => api.getAdminBooks(),
  createBook: (bookData) => api.createBook(bookData),
  updateBook: (id, bookData) => api.updateBook(id, bookData),
  deleteBook: (id) => api.deleteBook(id),
  getAdminWebinars: () => api.getAdminWebinars(),
  createWebinar: (webinarData) => api.createWebinar(webinarData),
  updateWebinar: (id, webinarData) => api.updateWebinar(id, webinarData),
  deleteWebinar: (id) => api.deleteWebinar(id),
};

export const articlesAPI = {
  getAll: (params = {}) => api.getArticles(params),
  getById: (id) => api.getArticleById(id),
  getFeatured: () => api.getFeaturedArticles(),
  getCategories: () => api.getArticleCategories(),
  getAdminArticles: () => api.getAdminArticles(),
  createArticle: (articleData) => api.createArticle(articleData),
  updateArticle: (id, articleData) => api.updateArticle(id, articleData),
  deleteArticle: (id) => api.deleteArticle(id),
  uploadArticleImage: (file) => api.uploadArticleImage(file),
  uploadArticleDocument: (file) => api.uploadArticleDocument(file),
};

export const booksAPI = {
  getAll: (params = {}) => api.getBooks(params),
  getById: (id) => api.getBookById(id),
  getCategories: () => api.getCategories(),
  getAdminBooks: () => api.getAdminBooks(),
  createBook: (bookData) => api.createBook(bookData),
  updateBook: (id, bookData) => api.updateBook(id, bookData),
  deleteBook: (id) => api.deleteBook(id),
  uploadBookCover: (file) => api.uploadBookCover(file),
};

export const webinarsAPI = {
  getAll: (params = {}) => api.getWebinars(params),
  getById: (id) => api.getWebinarById(id),
  getCategories: () => api.getWebinarCategories(),
  getFeatured: () => api.getFeaturedWebinars(),
  getAdminWebinars: () => api.getAdminWebinars(),
  createWebinar: (webinarData) => api.createWebinar(webinarData),
  updateWebinar: (id, webinarData) => api.updateWebinar(id, webinarData),
  deleteWebinar: (id) => api.deleteWebinar(id),
  uploadWebinarImage: (file) => api.uploadWebinarImage(file),
  register: (webinarId, userData) => api.registerForWebinar(webinarId, userData),
};

// ===== DEFAULT EXPORT =====
export default api;
export { axiosInstance as apiClient };