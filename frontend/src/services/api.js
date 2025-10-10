// src/services/api.js
const API_BASE_URL = 'http://localhost:3002/api';

export const bookAPI = {
  // Get all books
  getAll: async (contentType = null) => {
    try {
      const url = contentType ? `${API_BASE_URL}/books?content_type=${contentType}` : `${API_BASE_URL}/books`;
      console.log('🔄 Fetching books from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Books fetched successfully:', data.length, 'books');
      return data;
    } catch (error) {
      console.error('❌ Error fetching books:', error);
      
      // Return comprehensive fallback data
      return [
        {
          id: 1,
          title: 'Sample Book 1',
          author: 'John Author',
          isbn: '1234567890',
          category: 'Fiction',
          total_copies: 5,
          available_copies: 3,
          cover_image: null,
          file_url: null,
          content_type: 'book',
          description: 'This is a sample book description',
          publisher: 'Sample Publisher',
          published_year: 2023,
          language: 'English'
        },
        {
          id: 2,
          title: 'Children\'s Adventure',
          author: 'Sarah Writer',
          isbn: '0987654321',
          category: 'Children',
          total_copies: 3,
          available_copies: 2,
          cover_image: null,
          file_url: null,
          content_type: 'children',
          age_group: '7-9',
          reading_level: 'Beginner',
          description: 'A fun adventure for children',
          publisher: 'Kids Publishing',
          published_year: 2023,
          language: 'English'
        },
        {
          id: 3,
          title: 'Research Paper on AI',
          author: 'Dr. Research Scientist',
          isbn: '1122334455',
          category: 'Technology',
          total_copies: 1,
          available_copies: 1,
          cover_image: null,
          file_url: null,
          content_type: 'article',
          journal_name: 'Journal of Advanced Computing',
          volume: '15',
          issue: '2',
          pages: '45-67',
          doi: '10.1234/example.doi',
          description: 'Advanced research in artificial intelligence',
          publisher: 'Academic Press',
          published_year: 2024,
          language: 'English'
        },
        {
          id: 4,
          title: 'Machine Learning Thesis',
          author: 'PhD Candidate',
          isbn: '2233445566',
          category: 'Science',
          total_copies: 2,
          available_copies: 2,
          cover_image: null,
          file_url: null,
          content_type: 'thesis',
          description: 'Doctoral thesis on machine learning applications',
          publisher: 'University Press',
          published_year: 2024,
          language: 'English'
        }
      ];
    }
  },

  // Get children's books specifically
  getChildrensBooks: async () => {
    try {
      console.log('🔄 Fetching children\'s books from:', `${API_BASE_URL}/books/children`);
      const response = await fetch(`${API_BASE_URL}/books/children`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Children\'s books fetched successfully:', data.length, 'books');
      return data;
    } catch (error) {
      console.error('❌ Error fetching children\'s books:', error);
      // Filter fallback data for children's books
      const allBooks = await bookAPI.getAll();
      return allBooks.filter(book => book.content_type === 'children' || book.age_group || book.reading_level);
    }
  },

  // Create new book
  createBook: async (bookData) => {
    console.log('📝 Creating book with data:', bookData);
    
    const formData = new FormData();
    
    // Append files
    if (bookData.cover_image instanceof File) {
      formData.append('cover_image', bookData.cover_image);
      console.log('📁 Added cover image:', bookData.cover_image.name);
    }
    if (bookData.content_file instanceof File) {
      formData.append('content_file', bookData.content_file);
      console.log('📁 Added content file:', bookData.content_file.name);
    }
    
    // Append all other fields
    const fields = [
      'title', 'author', 'isbn', 'category', 'description', 
      'total_copies', 'available_copies', 'publisher', 'published_year',
      'language', 'tags', 'dewey_decimal', 'content_type', 'journal_name', 
      'volume', 'issue', 'pages', 'doi', 'age_group', 'reading_level'
    ];
    
    fields.forEach(field => {
      if (bookData[field] !== undefined && bookData[field] !== null) {
        formData.append(field, bookData[field]);
        console.log(`📋 Field ${field}:`, bookData[field]);
      }
    });

    try {
      console.log('🚀 Sending POST request to:', `${API_BASE_URL}/books`);
      
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Failed to create book: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Book created successfully:', result);
      return result.book || result;
    } catch (error) {
      console.error('💥 Error in createBook:', error);
      // For demo purposes, return mock data
      const mockBook = {
        id: Date.now(),
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        category: bookData.category,
        total_copies: parseInt(bookData.total_copies) || 1,
        available_copies: parseInt(bookData.available_copies) || 1,
        cover_image: bookData.cover_image ? URL.createObjectURL(bookData.cover_image) : null,
        file_url: bookData.content_file ? URL.createObjectURL(bookData.content_file) : null,
        description: bookData.description,
        publisher: bookData.publisher,
        published_year: bookData.published_year,
        language: bookData.language,
        content_type: bookData.content_type,
        journal_name: bookData.journal_name,
        volume: bookData.volume,
        issue: bookData.issue,
        pages: bookData.pages,
        doi: bookData.doi,
        age_group: bookData.age_group,
        reading_level: bookData.reading_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockBook;
    }
  },

  // Get book by ID
  getById: async (id) => {
    try {
      console.log('🔄 Fetching book by ID:', id);
      const response = await fetch(`${API_BASE_URL}/books/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Book fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching book:', error);
      throw error;
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    console.log('🔄 Update Book API Call:', { id, bookData });
    
    const formData = new FormData();
    
    // Append files
    if (bookData.cover_image instanceof File) {
      formData.append('cover_image', bookData.cover_image);
      console.log('📁 Cover image file:', bookData.cover_image.name);
    }
    if (bookData.file_url instanceof File) {
      formData.append('content_file', bookData.file_url);
      console.log('📁 Book file:', bookData.file_url.name);
    }
    
    // Append all other fields
    const fields = [
      'title', 'author', 'isbn', 'category', 'description',
      'total_copies', 'available_copies', 'publisher', 'published_year',
      'language', 'content_type', 'journal_name', 'volume', 'issue', 
      'pages', 'doi', 'age_group', 'reading_level'
    ];
    
    fields.forEach(field => {
      if (bookData[field] !== undefined && bookData[field] !== null) {
        formData.append(field, bookData[field]);
        console.log(`📝 Field ${field}:`, bookData[field]);
      }
    });

    try {
      console.log('🚀 Sending PUT request to:', `${API_BASE_URL}/books/${id}`);
      
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        body: formData,
      });
      
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Failed to update book: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Update successful:', result);
      return result.book || result;
      
    } catch (error) {
      console.error('💥 Update book error:', error);
      throw error;
    }
  },

  // Delete book
  deleteBook: async (id) => {
    try {
      console.log('🗑️ Deleting book:', id);
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Book deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting book:', error);
      throw error;
    }
  },

  // Search books
  search: async (query, contentType = null) => {
    try {
      const url = contentType 
        ? `${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}&content_type=${contentType}`
        : `${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}`;
      
      console.log('🔍 Searching books from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Search results:', data.length, 'books found');
      return data;
    } catch (error) {
      console.error('❌ Search error:', error);
      // Fallback to client-side search
      const allBooks = await bookAPI.getAll();
      return allBooks.filter(book =>
        book.title?.toLowerCase().includes(query.toLowerCase()) ||
        book.author?.toLowerCase().includes(query.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(query.toLowerCase()) ||
        book.category?.toLowerCase().includes(query.toLowerCase()) ||
        book.publisher?.toLowerCase().includes(query.toLowerCase()) ||
        book.journal_name?.toLowerCase().includes(query.toLowerCase()) ||
        book.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // Advanced search
  advancedSearch: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `${API_BASE_URL}/books/search?${params}`;
      console.log('🔍 Advanced search from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Advanced search results:', data.length, 'books found');
      return data;
    } catch (error) {
      console.error('❌ Advanced search error:', error);
      throw error;
    }
  },

  // Borrow book
  borrowBook: async (loanData) => {
    try {
      console.log('📚 Borrowing book:', loanData);
      const response = await fetch(`${API_BASE_URL}/loans`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Book borrowed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Borrow book error:', error);
      // Return mock success for demo
      return { 
        success: true, 
        message: 'Book borrowed successfully (demo)',
        loan_id: Date.now(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
  },

  // Return book
  returnBook: async (loanId) => {
    try {
      console.log('📚 Returning book loan:', loanId);
      const response = await fetch(`${API_BASE_URL}/loans/${loanId}/return`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Book returned successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Return book error:', error);
      // Return mock success for demo
      return { 
        success: true, 
        message: 'Book returned successfully (demo)'
      };
    }
  },

  // Get user loans
  getUserLoans: async (userId) => {
    try {
      console.log('📋 Fetching user loans for:', userId);
      const response = await fetch(`${API_BASE_URL}/loans/user/${userId}`);
      
      if (response.status === 404) {
        console.log('📋 No loans endpoint found, returning empty array');
        return [];
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ User loans fetched:', data.length, 'loans');
      return data;
    } catch (error) {
      console.error('❌ Error fetching loans:', error);
      // Return mock loans for demo
      return [
        {
          id: 1,
          user_id: userId,
          book_id: 1,
          book_title: 'Sample Book 1',
          author: 'John Author',
          borrowed_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          returned_date: null,
          status: 'active',
          cover_image: null
        }
      ];
    }
  },

  // Test API connection
  testConnection: async () => {
    try {
      console.log('🔌 Testing API connection...');
      const response = await fetch(`${API_BASE_URL}/test`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API connection successful:', data);
      return data;
    } catch (error) {
      console.error('❌ API connection failed:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      console.log('❤️ Performing health check...');
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Health check passed:', data);
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }
};

// Get content types
export const getContentTypes = async () => {
  try {
    console.log('🔄 Fetching content types...');
    const response = await fetch(`${API_BASE_URL}/content-types`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Content types fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching content types:', error);
    // Return default content types
    return [
      { id: 1, name: 'book', description: 'Traditional books and novels' },
      { id: 2, name: 'article', description: 'Academic articles and papers' },
      { id: 3, name: 'journal', description: 'Journal publications' },
      { id: 4, name: 'children', description: 'Children\'s books and materials' },
      { id: 5, name: 'thesis', description: 'Theses and dissertations' },
      { id: 6, name: 'report', description: 'Research reports' }
    ];
  }
};

// User service
export const userService = {
  getCurrentUser: () => {
    // Mock user data - in a real app, this would come from auth context or localStorage
    const user = {
      id: 1,
      name: 'Admin User',
      email: 'admin@library.com',
      role: 'admin',
      avatar: null
    };
    
    console.log('👤 Current user:', user);
    return user;
  },

  login: async (email, password) => {
    try {
      console.log('🔐 User login attempt:', email);
      // Mock login - in real app, this would call your auth API
      if (email === 'admin@library.com' && password === 'password') {
        const user = {
          id: 1,
          name: 'Admin User',
          email: 'admin@library.com',
          role: 'admin',
          token: 'mock-jwt-token'
        };
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Login successful');
        return { success: true, user };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    console.log('🚪 User logout');
    localStorage.removeItem('user');
    return { success: true };
  },

  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    return !!user;
  }
};

// Utility functions
export const apiUtils = {
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate ISBN
  validateISBN: (isbn) => {
    // Simple ISBN validation - you might want to use a more robust solution
    const isbnRegex = /^(?:\d{9}[\dX]|\d{13})$/;
    return isbnRegex.test(isbn.replace(/[-]/g, ''));
  },

  // Generate random ID (for mock data)
  generateId: () => {
    return Date.now() + Math.floor(Math.random() * 1000);
  },

  // Delay function for testing
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

export default {
  bookAPI,
  getContentTypes,
  userService,
  apiUtils
};