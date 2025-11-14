import { bookService } from "../services/bookService";
import { articleService } from "../services/articleService";
import { webinarService } from "../services/webinarService";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { uploadService } from "../services/uploadService";
import { apiService } from "../services/apiService";

// Re-export config values for use in other files
export { API_BASE_URL, REQUEST_TIMEOUT, API_ERRORS } from "./apiConfig";

// Main API object for backward compatibility - KEEP THIS FOR EXISTING COMPONENTS
export const api = {
  // ===== ADMIN - DASHBOARD =====
  getDashboardStats: async () => apiService.get("/admin/dashboard"),

  // ===== ADMIN - BOOKS =====
  getAdminBooks: async () => apiService.get("/admin/books"),
  createBook: (bookData) => bookService.createBook(bookData),
  updateBook: (id, bookData) => bookService.updateBook(id, bookData),
  deleteBook: (id) => bookService.deleteBook(id),

  // ===== BOOKS - PUBLIC =====
  getBooks: (params) => bookService.getBooks(params),
  getBookById: (id) => bookService.getBookById(id),
  getCategories: () => bookService.getCategories(),
  getFeaturedBooks: () => bookService.getFeaturedBooks(),
  searchBooks: (query, params = {}) => bookService.searchBooks(query, params),
  getBooksByCategory: (category, params = {}) =>
    bookService.getBooksByCategory(category, params),

  // ===== ADMIN - ARTICLES =====
  getAdminArticles: async () => apiService.get("/admin/articles"),
  createArticle: (articleData) => articleService.createArticle(articleData),
  updateArticle: (id, articleData) =>
    articleService.updateArticle(id, articleData),
  deleteArticle: (id) => articleService.deleteArticle(id),

  // ===== ARTICLES - PUBLIC =====
  getArticles: (params) => articleService.getArticles(params),
  getArticleById: (id) => articleService.getArticleById(id),
  getArticleCategories: () => articleService.getCategories(),
  getFeaturedArticles: () => articleService.getFeaturedArticles(),

  // ===== ADMIN - WEBINARS =====
  getAdminWebinars: async () => apiService.get("/admin/webinars"),
  createWebinar: (webinarData) => webinarService.createWebinar(webinarData),
  updateWebinar: (id, webinarData) =>
    webinarService.updateWebinar(id, webinarData),
  deleteWebinar: (id) => webinarService.deleteWebinar(id),

  // ===== WEBINARS - PUBLIC =====
  getWebinars: (params) => webinarService.getWebinars(params),
  getWebinarById: (id) => webinarService.getWebinarById(id),
  getWebinarCategories: () => webinarService.getCategories(),
  getFeaturedWebinars: () => webinarService.getFeaturedWebinars(),
  registerForWebinar: (webinarId, userData) =>
    webinarService.registerForWebinar(webinarId, userData),

  // ===== AUTH =====
  login: (email, password) => authService.login(email, password),
  register: (userData) => authService.register(userData),
  getCurrentUser: () => authService.getCurrentUser(),

  // ===== USERS =====
  getUsers: () => userService.getUsers(),
  updateUser: (id, userData) => userService.updateUser(id, userData),

  // ===== AFFILIATES =====
  getAffiliates: () => userService.getAffiliates(),
  updateAffiliateStatus: (id, statusData) =>
    userService.updateAffiliateStatus(id, statusData),

  // ===== UPLOADS =====
  uploadImage: (file) => uploadService.uploadImage(file),
  uploadFile: (file) => uploadService.uploadFile(file),
  uploadBookCover: (file) => bookService.uploadCover(file),
  uploadBookFile: (file) => bookService.uploadBookFile(file),

  // ===== TEST ENDPOINTS =====
  testConnection: async () => apiService.get("/health"),
  getStatus: async () => apiService.get("/status"),
  testDatabase: async () => apiService.get("/db-test"),
};

// Export individual services for new components
export {
  bookService,
  articleService,
  webinarService,
  authService,
  userService,
  uploadService,
  apiService,
};

// Default export for backward compatibility
export default api;
