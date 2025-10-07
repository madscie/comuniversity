const API_BASE_URL = 'http://localhost:3002/api';

export const bookAPI = {
  // Get all books
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      // Return mock data for demo purposes
      return [
        {
          id: 1,
          title: 'Attention is All You Need',
          author: 'Vans Rama',
          isbn: '1234567890',
          category: 'Technology',
          total_copies: 5,
          available_copies: 5,
          cover_image: null,
          file_url: null
        },
        {
          id: 2,
          title: 'The Kit',
          author: 'Mike Whites',
          isbn: '0987654321',
          category: 'Fiction',
          total_copies: 1,
          available_copies: 1,
          cover_image: null,
          file_url: null
        }
      ];
    }
  },

  // Create new book
  createBook: async (bookData) => {
    console.log('Creating book with comprehensive data:', bookData);
    
    const formData = new FormData();
    
    // Append files
    if (bookData.cover_image instanceof File) {
      formData.append('cover_image', bookData.cover_image);
    }
    if (bookData.content_file instanceof File) {
      formData.append('content_file', bookData.content_file);
    }
    if (bookData.file_url instanceof File) {
      formData.append('content_file', bookData.file_url);
    }
    
    // Append all other fields from your comprehensive form
    const fields = [
      'title', 'author', 'isbn', 'category', 'description', 
      'total_copies', 'available_copies', 'publisher', 'published_year',
      'language', 'tags', 'dewey_decimal', 'journal_name', 'volume',
      'issue', 'pages', 'doi', 'age_group', 'reading_level'
    ];
    
    fields.forEach(field => {
      if (bookData[field] !== undefined && bookData[field] !== null) {
        formData.append(field, bookData[field]);
      }
    });

    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData - ${key}:`, value instanceof File ? `${value.name} (File)` : value);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create book: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Book created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in createBook:', error);
      // For demo purposes, return mock data
      const mockBook = {
        id: Date.now(),
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        category: bookData.category,
        total_copies: parseInt(bookData.total_copies),
        available_copies: parseInt(bookData.available_copies),
        cover_image: bookData.cover_image ? URL.createObjectURL(bookData.cover_image) : null,
        file_url: bookData.content_file ? URL.createObjectURL(bookData.content_file) : null,
        description: bookData.description,
        publisher: bookData.publisher,
        published_year: bookData.published_year,
        language: bookData.language
      };
      return mockBook;
    }
  },

  // Get book by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    if (!response.ok) throw new Error('Failed to fetch book');
    return response.json();
  },

  // Update book - FIXED VERSION
  updateBook: async (id, bookData) => {
    console.log('🔄 Update Book API Call:', { id, bookData });
    
    const formData = new FormData();
    
    // Append files - USE CORRECT FIELD NAMES THAT MATCH BACKEND
    if (bookData.cover_image instanceof File) {
      formData.append('cover_image', bookData.cover_image);
      console.log('📁 Cover image file:', bookData.cover_image.name);
    }
    if (bookData.file_url instanceof File) {
      formData.append('content_file', bookData.file_url);
      console.log('📁 Book file:', bookData.file_url.name);
    }
    
    // Append all other fields - USE category (not category_id)
    const fields = [
      'title', 'author', 'isbn', 'category', 'description',
      'total_copies', 'available_copies', 'publisher', 'published_year',
      'language'
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
      return result;
      
    } catch (error) {
      console.error('💥 Update book error:', error);
      throw error;
    }
  },

  deleteBook: async (id) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete book');
    return response.json();
  },

  borrowBook: async (loanData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData),
      });
      if (!response.ok) throw new Error('Failed to borrow book');
      return response.json();
    } catch (error) {
      console.error('Borrow book error:', error);
      return { success: true, message: 'Book borrowed successfully' };
    }
  },

  returnBook: async (loanId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/${loanId}/return`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to return book');
      return response.json();
    } catch (error) {
      console.error('Return book error:', error);
      return { success: true, message: 'Book returned successfully' };
    }
  },

  getUserLoans: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/user/${userId}`);
      if (response.status === 404) {
        console.log('No loans endpoint found, returning empty array');
        return [];
      }
      if (!response.ok) throw new Error('Failed to fetch user loans');
      return response.json();
    } catch (error) {
      console.error('Error fetching loans, returning empty array:', error);
      return [];
    }
  }
};

export const userService = {
  getCurrentUser: () => {
    return {
      id: 1,
      name: 'Admin User',
      email: 'admin@library.com',
      role: 'admin'
    };
  }
};