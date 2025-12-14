// import axios from "axios";
// import {
//   API_BASE_URL,
//   REQUEST_TIMEOUT,
//   handleResponse,
//   handleError,
// } from "../config/apiConfig";

// class ApiService {
//   constructor() {
//     this.baseUrl = API_BASE_URL; // Store baseUrl for upload method
//     this.axiosInstance = axios.create({
//       baseURL: API_BASE_URL,
//       timeout: REQUEST_TIMEOUT,
//       withCredentials: true,
//     });

//     this.setupInterceptors();
//   }

//   setupInterceptors() {
//     // Request interceptor
//     this.axiosInstance.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem("token");
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         // DEBUG: Check what's being sent
//         if (config.data instanceof FormData) {
//           console.log("🔍 FormData being sent:");
//           for (let [key, value] of config.data.entries()) {
//             console.log(`  ${key}:`, value.name, value.type, value.size);
//           }
//         } else {
//           console.log("🔍 Data being sent:", config.data);
//         }

//         return config;
//       },
//       (error) => {
//         console.error("❌ Request Interceptor Error:", error);
//         return Promise.reject(error);
//       }
//     );

//     // Response interceptor
//     this.axiosInstance.interceptors.response.use(handleResponse, handleError);
//   }

//   // Generic HTTP methods
//   async get(endpoint, params = {}) {
//     return this.axiosInstance.get(endpoint, { params });
//   }

//   async post(endpoint, data = {}) {
//     return this.axiosInstance.post(endpoint, data);
//   }

//   async put(endpoint, data = {}) {
//     return this.axiosInstance.put(endpoint, data);
//   }

//   async patch(endpoint, data = {}) {
//     return this.axiosInstance.patch(endpoint, data);
//   }

//   async delete(endpoint) {
//     return this.axiosInstance.delete(endpoint);
//   }

//   // FIXED: Use axios consistently for upload method
//   async upload(endpoint, formData) {
//     try {
//       console.log(`📤 Uploading to: ${endpoint}`);

//       // Log FormData contents
//       if (formData instanceof FormData) {
//         console.log("🔍 FormData contents:");
//         for (let [key, value] of formData.entries()) {
//           if (value instanceof File) {
//             console.log(`  ${key}:`, value.name, value.type, value.size);
//           } else {
//             console.log(`  ${key}:`, value);
//           }
//         }
//       }

//       const response = await this.axiosInstance.post(endpoint, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log(`✅ Upload successful:`, response.data);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Upload error:`, error);
//       throw error;
//     }
//   }
// }

// // Create singleton instance
// export const apiService = new ApiService();





// src/services/apiService.js - ✅ FIXED VERSION
import axios from "axios";
import {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  handleResponse,
  handleError,
} from "../config/apiConfig";

class ApiService {
  constructor() {
    console.log("🔧 API Service Initializing...");
    console.log("🔧 API_BASE_URL:", API_BASE_URL);
    
    this.baseUrl = API_BASE_URL;
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token") || 
                      localStorage.getItem("auth_token") ||
                      localStorage.getItem("clerk-db-jwt");
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        
        if (config.data instanceof FormData) {
          console.log("📁 FormData being sent");
          for (let [key, value] of config.data.entries()) {
            if (value instanceof File) {
              console.log(`  📄 ${key}: ${value.name} (${value.size} bytes)`);
            }
          }
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

  // GET request
  async get(endpoint, params = {}) {
    try {
      console.log(`📥 GET ${endpoint}`, params);
      const response = await this.axiosInstance.get(endpoint, { params });
      return response;
    } catch (error) {
      console.error(`❌ GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  // POST request
  async post(endpoint, data = {}, config = {}) {
    try {
      console.log(`📤 POST ${endpoint}`, data);
      const response = await this.axiosInstance.post(endpoint, data, config);
      return response;
    } catch (error) {
      console.error(`❌ POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  // PUT request
  async put(endpoint, data = {}) {
    try {
      console.log(`🔄 PUT ${endpoint}`, data);
      const response = await this.axiosInstance.put(endpoint, data);
      return response;
    } catch (error) {
      console.error(`❌ PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    try {
      console.log(`🔧 PATCH ${endpoint}`, data);
      const response = await this.axiosInstance.patch(endpoint, data);
      return response;
    } catch (error) {
      console.error(`❌ PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      console.log(`🗑️ DELETE ${endpoint}`);
      const response = await this.axiosInstance.delete(endpoint);
      return response;
    } catch (error) {
      console.error(`❌ DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Upload with FormData
  async upload(endpoint, formData) {
    try {
      console.log(`📤 Uploading to ${endpoint}`);
      
      if (formData instanceof FormData) {
        console.log("📁 FormData contents:");
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`  📄 ${key}: ${value.name} (${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  📝 ${key}: ${value}`);
          }
        }
      }

      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(`✅ Upload successful to ${endpoint}`);
      return response;
    } catch (error) {
      console.error(`❌ Upload to ${endpoint} failed:`, error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();
