// services/bookService.js
import { apiService } from "./apiService";

class BookService {
  async getBooks(params = {}) {
    try {
      console.log("📚 Fetching books with params:", params);

      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          cleanParams[key] = params[key];
        }
      });

      // If includeAll is true, the backend should return all books regardless of status
      const response = await apiService.get("/books", cleanParams);
      console.log("📚 Books API Response:", response);

      // Handle different response structures
      if (response.success) {
        const booksData = response.data?.books || response.data || [];
        console.log(`✅ Loaded ${booksData.length} books from API`);
        return response;
      } else {
        console.error("❌ Failed to load books:", response.message);
        return { success: false, message: response.message, data: [] };
      }
    } catch (error) {
      console.error("❌ Error in getBooks:", error);
      return {
        success: false,
        message: error.message || "Failed to load books",
        data: [],
      };
    }
  }

  async getBookById(id) {
    try {
      const response = await apiService.get(`/books/${id}`);
      console.log(`📖 Book ${id} API Response:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching book ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to load book",
        data: null,
      };
    }
  }

  async getCategories() {
    try {
      const response = await apiService.get("/books/categories");
      console.log("📚 Categories API Response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      return {
        success: false,
        message: error.message || "Failed to load categories",
        data: [],
      };
    }
  }

  async getFeaturedBooks() {
    try {
      const response = await apiService.get("/books/featured");
      console.log("⭐ Featured Books API Response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching featured books:", error);
      return {
        success: false,
        message: error.message || "Failed to load featured books",
        data: [],
      };
    }
  }

  async searchBooks(query, params = {}) {
    try {
      const response = await apiService.get("/books/search", {
        q: query,
        ...params,
      });
      console.log(`🔍 Search for "${query}" API Response:`, response);
      return response;
    } catch (error) {
      console.error("❌ Error searching books:", error);
      return {
        success: false,
        message: error.message || "Search failed",
        data: [],
      };
    }
  }

  async getBooksByCategory(category, params = {}) {
    try {
      console.log(`📚 Fetching books for category: "${category}"`);

      // Ensure category is properly encoded
      const encodedCategory = encodeURIComponent(category);
      const response = await apiService.get(
        `/books/category/${encodedCategory}`,
        params
      );

      console.log(`📚 Category "${category}" API Response:`, response);

      // Handle different response structures from the API
      if (response && response.success) {
        // Standard success response
        return {
          success: true,
          data: {
            books:
              response.data?.books || response.data || response.books || [],
            category: category,
            count: (
              response.data?.books ||
              response.data ||
              response.books ||
              []
            ).length,
          },
          message:
            response.message ||
            `Found ${
              (response.data?.books || response.data || response.books || [])
                .length
            } books in ${category}`,
        };
      } else if (response && Array.isArray(response)) {
        // API returned direct array
        return {
          success: true,
          data: {
            books: response,
            category: category,
            count: response.length,
          },
          message: `Found ${response.length} books in ${category}`,
        };
      } else if (response && response.data) {
        // API returned data directly
        const booksArray = Array.isArray(response.data)
          ? response.data
          : [response.data];
        return {
          success: true,
          data: {
            books: booksArray,
            category: category,
            count: booksArray.length,
          },
          message: `Found ${booksArray.length} books in ${category}`,
        };
      } else {
        // Unexpected response structure
        console.warn("⚠️ Unexpected API response structure:", response);
        return {
          success: false,
          message: response?.message || "Unexpected response format",
          data: { books: [], category: category, count: 0 },
        };
      }
    } catch (error) {
      console.error(
        `❌ Error fetching books for category "${category}":`,
        error
      );

      // Provide detailed error information
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          `Failed to load books in ${category}`,
        status: error.response?.status || 500,
        data: {
          books: [],
          category: category,
          count: 0,
        },
        error: error,
      };
    }
  }

  // Create book with file upload capability
  async createBook(bookData) {
    try {
      console.log("📤 Creating book with data:", bookData);

      // Use FormData if there are files, otherwise JSON
      if (bookData.coverImage || bookData.bookFile) {
        const formData = new FormData();

        // Append all book data
        Object.keys(bookData).forEach((key) => {
          if (key !== "coverImage" && key !== "bookFile") {
            formData.append(key, bookData[key]);
          }
        });

        // Append files if they exist
        if (bookData.coverImage) {
          formData.append("cover_image", bookData.coverImage);
        }
        if (bookData.bookFile) {
          formData.append("book_file", bookData.bookFile);
        }

        const response = await apiService.post("/books", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("📤 Create book response:", response);
        return response;
      }

      // Regular JSON request if no files
      const response = await apiService.post("/books", bookData);
      console.log("📤 Create book response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating book:", error);
      return {
        success: false,
        message: error.message || "Failed to create book",
        data: null,
      };
    }
  }

  // UPDATE BOOK METHOD
  async updateBook(id, bookData) {
    try {
      console.log("📤 Updating book with data:", { id, bookData });

      // Use FormData if there are files, otherwise JSON
      if (bookData.coverImage || bookData.bookFile) {
        const formData = new FormData();

        // Append all book data
        Object.keys(bookData).forEach((key) => {
          if (key !== "coverImage" && key !== "bookFile") {
            formData.append(key, bookData[key]);
          }
        });

        // Append files if they exist
        if (bookData.coverImage) {
          formData.append("cover_image", bookData.coverImage);
        }
        if (bookData.bookFile) {
          formData.append("book_file", bookData.bookFile);
        }

        console.log("📁 Sending FormData with files");
        const response = await apiService.put(`/books/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("📤 Update book response:", response);
        return response;
      }

      // Regular JSON request if no files
      console.log("📄 Sending JSON data");
      const response = await apiService.put(`/books/${id}`, bookData);
      console.log("📤 Update book response:", response);
      return response;
    } catch (error) {
      console.error("❌ BookService update error:", error);
      return {
        success: false,
        message: error.message || "Failed to update book",
        data: null,
      };
    }
  }

  // Update book status
  async updateBookStatus(id, status) {
    try {
      console.log("🔄 Updating book status:", { id, status });
      const response = await apiService.put(`/books/${id}/status`, { status });
      console.log("📤 Update status response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating book status:", error);
      return {
        success: false,
        message: error.message || "Failed to update book status",
        data: null,
      };
    }
  }

  async deleteBook(id) {
    try {
      console.log("🗑️ Deleting book:", id);
      const response = await apiService.delete(`/books/${id}`);
      console.log("📤 Delete book response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error deleting book:", error);
      return {
        success: false,
        message: error.message || "Failed to delete book",
        data: null,
      };
    }
  }

  // Utility method to get books by multiple categories
  async getBooksByMultipleCategories(categories) {
    try {
      console.log("📚 Fetching books for multiple categories:", categories);

      const promises = categories.map((category) =>
        this.getBooksByCategory(category)
      );

      const results = await Promise.all(promises);

      // Combine all books from successful requests
      const allBooks = results
        .filter((result) => result.success)
        .flatMap((result) => result.data?.books || []);

      // Remove duplicates by book ID
      const uniqueBooks = allBooks.filter(
        (book, index, self) => index === self.findIndex((b) => b.id === book.id)
      );

      return {
        success: true,
        data: {
          books: uniqueBooks,
          categories: categories,
          count: uniqueBooks.length,
        },
        message: `Found ${uniqueBooks.length} unique books across ${categories.length} categories`,
      };
    } catch (error) {
      console.error("❌ Error fetching books by multiple categories:", error);
      return {
        success: false,
        message:
          error.message || "Failed to load books from multiple categories",
        data: { books: [], categories: categories, count: 0 },
      };
    }
  }
}

export const bookService = new BookService();
