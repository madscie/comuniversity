// src/services/webinarService.js - FIXED VERSION
import axios from "axios";

// const API_URL = "http://localhost:5000/api/webinars";
const API_URL = "https://comuniversity-backend.onrender.com/api/webinars";

// Define all service functions as individual functions
const getWebinars = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching webinars:", error);
    throw error;
  }
};

const getWebinarById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching webinar:", error);
    throw error;
  }
};

const createWebinar = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating webinar:", error);
    throw error;
  }
};

const updateWebinar = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating webinar:", error);
    throw error;
  }
};

const deleteWebinar = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting webinar:", error);
    throw error;
  }
};

const registerForWebinar = async (webinarId, registrationData) => {
  try {
    const response = await axios.post(`${API_URL}/${webinarId}/register`, registrationData);
    return response.data;
  } catch (error) {
    console.error("Error registering for webinar:", error);
    throw error;
  }
};

const getWebinarRegistrations = async (webinarId) => {
  try {
    const response = await axios.get(`${API_URL}/${webinarId}/registrations`);
    return response.data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error;
  }
};

const getAdminWebinars = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin webinars:", error);
    throw error;
  }
};

const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching webinar categories:", error);
    throw error;
  }
};

const getFeaturedWebinars = async () => {
  try {
    const response = await axios.get(API_URL);
    if (response.data.success) {
      const webinars = response.data.data.webinars || [];
      // Filter for featured webinars (you might need to adjust this logic)
      return {
        success: true,
        data: {
          webinars: webinars.filter(w => w.featured).slice(0, 6)
        }
      };
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching featured webinars:", error);
    throw error;
  }
};

// Create the webinarService object that matches what your api.js expects
const webinarService = {
  // Main methods used by api.js
  getWebinars,
  getWebinarById,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  registerForWebinar,
  getWebinarRegistrations,
  getAdminWebinars,
  getCategories,
  getFeaturedWebinars,
  
  // Additional methods that might be used elsewhere
  searchWebinars: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error("Error searching webinars:", error);
      throw error;
    }
  }
};

// Export as a named export - THIS IS WHAT YOUR API.JS EXPECTS
export { webinarService };

// Also export as default for convenience
export default webinarService;
