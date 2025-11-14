// services/bookService.js
import { apiService } from "./apiService";

class BookService {
  async getBooks(params = {}) {
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
    return apiService.get("/books", cleanParams);
  }

  async getBookById(id) {
    return apiService.get(`/books/${id}`);
  }

  async getCategories() {
    return apiService.get("/books/categories");
  }

  async getFeaturedBooks() {
    return apiService.get("/books/featured");
  }

  async searchBooks(query, params = {}) {
    return apiService.get("/books/search", { q: query, ...params });
  }

  async getBooksByCategory(category, params = {}) {
    return apiService.get(`/books/category/${category}`, params);
  }

  // Create book with file upload capability
  async createBook(bookData) {
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

      return apiService.post("/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // Regular JSON request if no files
    return apiService.post("/books", bookData);
  }

  // UPDATE BOOK METHOD - ADD THIS
  async updateBook(id, bookData) {
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

      return apiService.put(`/books/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // Regular JSON request if no files
    return apiService.put(`/books/${id}`, bookData);
  }

  // Update book status
  async updateBookStatus(id, status) {
    console.log("🔄 Updating book status:", { id, status });
    return apiService.put(`/books/${id}/status`, { status });
  }

  async deleteBook(id) {
    return apiService.delete(`/books/${id}`);
  }
}

export const bookService = new BookService();
