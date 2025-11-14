import axios from "axios";
import {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  handleResponse,
  handleError,
} from "../config/apiConfig";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL; // Store baseUrl for upload method
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // DEBUG: Check what's being sent
        if (config.data instanceof FormData) {
          console.log("🔍 FormData being sent:");
          for (let [key, value] of config.data.entries()) {
            console.log(`  ${key}:`, value.name, value.type, value.size);
          }
        } else {
          console.log("🔍 Data being sent:", config.data);
        }

        return config;
      },
      (error) => {
        console.error("❌ Request Interceptor Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(handleResponse, handleError);
  }

  // Generic HTTP methods
  async get(endpoint, params = {}) {
    return this.axiosInstance.get(endpoint, { params });
  }

  async post(endpoint, data = {}) {
    return this.axiosInstance.post(endpoint, data);
  }

  async put(endpoint, data = {}) {
    return this.axiosInstance.put(endpoint, data);
  }

  async patch(endpoint, data = {}) {
    return this.axiosInstance.patch(endpoint, data);
  }

  async delete(endpoint) {
    return this.axiosInstance.delete(endpoint);
  }

  // FIXED: Use axios consistently for upload method
  async upload(endpoint, formData) {
    try {
      console.log(`📤 Uploading to: ${endpoint}`);

      // Log FormData contents
      if (formData instanceof FormData) {
        console.log("🔍 FormData contents:");
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}:`, value.name, value.type, value.size);
          } else {
            console.log(`  ${key}:`, value);
          }
        }
      }

      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(`✅ Upload successful:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Upload error:`, error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();
