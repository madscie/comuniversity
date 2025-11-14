// API Configuration and Utilities
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Request timeout configuration
const REQUEST_TIMEOUT = 30000;

// API Error Types for better error handling
export const API_ERRORS = {
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
};

// API Response Handler
const handleResponse = (response) => {
  console.log("✅ API Success:", response.config.url, response.data);
  return response.data;
};

// API Error Handler
const handleError = (error) => {
  const errorContext = {
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString(),
  };

  if (error.response) {
    // Server responded with error status
    const serverError = {
      type: API_ERRORS.SERVER_ERROR,
      status: error.response.status,
      message: error.response.data?.message || "Server error occurred",
      data: error.response.data,
      context: errorContext,
    };

    console.error("❌ Server Error:", serverError);
    return Promise.reject(serverError);
  } else if (error.request) {
    // Network error
    const networkError = {
      type: API_ERRORS.NETWORK_ERROR,
      message: "Network error - please check your connection",
      context: errorContext,
    };

    console.error("❌ Network Error:", networkError);
    return Promise.reject(networkError);
  } else {
    // Other errors
    const generalError = {
      type: API_ERRORS.VALIDATION_ERROR,
      message: error.message,
      context: errorContext,
    };

    console.error("❌ General Error:", generalError);
    return Promise.reject(generalError);
  }
};

export { API_BASE_URL, REQUEST_TIMEOUT, handleResponse, handleError };
