const API_BASE_URL = 'http://localhost:3002/api';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Book API methods
export const bookAPI = {
  // Get all books
  getAll: () => apiRequest('api/books'),
  
  // Get book by ID
  getById: (id) => apiRequest(`/books/${id}`),
  
  // Create new book
  create: (bookData) => {
    const formData = new FormData();
    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== null && bookData[key] !== undefined) {
        formData.append(key, bookData[key]);
      }
    });
    
    return apiRequest('api/books', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
  },
  
  // Update book
  update: (id, bookData) => apiRequest(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  }),
  
  // Delete book
  delete: (id) => apiRequest(`/books/${id}`, {
    method: 'DELETE',
  }),
  
  // Search books
  search: (query) => apiRequest(`/books/search?q=${encodeURIComponent(query)}`),
};

// Auth API methods
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  adminLogin: (credentials) => apiRequest('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getMe: () => apiRequest('/auth/me'),
};

export default apiRequest;