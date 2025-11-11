// src/data/booksData.js

const API_BASE = 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Remove all mock data and use real API calls
export const booksData = []; // This will be populated from API

// Helper function to get book by ID
export const getBookById = async (id) => {
  try {
    const data = await apiCall(`${API_BASE}/books/${id}`);
    return data.data?.book || null;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw new Error('Failed to fetch book');
  }
};

// Helper function to search books
export const searchBooks = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams({ q: query, ...filters });
    const data = await apiCall(`${API_BASE}/books/search?${params}`);
    return data.data || [];
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

// Get books by category
export const getBooksByCategory = async (category) => {
  try {
    const data = await apiCall(`${API_BASE}/books?category=${encodeURIComponent(category)}`);
    return data.data?.books || [];
  } catch (error) {
    console.error('Error fetching books by category:', error);
    return [];
  }
};

// Get featured books
export const getFeaturedBooks = async (limit = 6) => {
  try {
    const data = await apiCall(`${API_BASE}/books/featured?limit=${limit}`);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return [];
  }
};

// Get all unique categories for filtering
export const getAllCategories = async () => {
  try {
    const data = await apiCall(`${API_BASE}/books/categories`);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Get all books
export const getAllBooks = async () => {
  try {
    const data = await apiCall(`${API_BASE}/books`);
    return data.data?.books || [];
  } catch (error) {
    console.error('Error fetching all books:', error);
    return [];
  }
};

// Get all unique authors for filtering
export const getAllAuthors = async () => {
  try {
    const data = await apiCall(`${API_BASE}/books`);
    const books = data.data?.books || [];
    const authors = [...new Set(books.map(book => book.author))];
    return authors;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
};

// Helper to get free books
export const getFreeBooks = async () => {
  try {
    const data = await apiCall(`${API_BASE}/books?minPrice=0&maxPrice=0`);
    return data.data?.books || [];
  } catch (error) {
    console.error('Error fetching free books:', error);
    return [];
  }
};

// Helper to get paid books
export const getPaidBooks = async () => {
  try {
    const data = await apiCall(`${API_BASE}/books?minPrice=0.01&maxPrice=1000`);
    return data.data?.books || [];
  } catch (error) {
    console.error('Error fetching paid books:', error);
    return [];
  }
};
