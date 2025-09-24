const API_BASE_URL = 'http://localhost:3002/api';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Create base headers - don't include Content-Type by default for FormData
  const baseHeaders = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  // Only add Content-Type if it's not FormData and not already set
  if (!(options.body instanceof FormData) && !options.headers?.['Content-Type']) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const defaultOptions = {
    headers: baseHeaders,
  };

  try {
    console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Request method:', options.method || 'GET');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Book API methods - FIXED
export const bookAPI = {
  // Get all books - FIXED: returns array directly
  getAll: () => apiRequest('/books'),
  
  // Get book by ID
  getById: (id) => apiRequest(`/books/${id}`),
  
  // Create new book
  create: (bookData) => {
    const formData = new FormData();
    
    // Append files with correct field names
    if (bookData.content_file) {
      formData.append('content_file', bookData.content_file);
    }
    if (bookData.cover_image) {
      formData.append('cover_image', bookData.cover_image);
    }
    
    // Append other book data
    Object.keys(bookData).forEach(key => {
      if (key !== 'content_file' && key !== 'cover_image' && 
          bookData[key] !== null && bookData[key] !== undefined) {
        formData.append(key, bookData[key]);
      }
    });
    
    // Debug: Log FormData contents
    console.log('FormData contents for book creation:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }
    
    return apiRequest('/books', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
  },
  
  // Update book
  update: (id, bookData) => {
    if (bookData instanceof FormData) {
      return apiRequest(`/books/${id}`, {
        method: 'PUT',
        body: bookData,
      });
    }
    return apiRequest(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  },
  
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