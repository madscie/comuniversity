import { apiService } from "./apiService";

class WebinarService {
  async getWebinars(params = {}) {
    return apiService.get("/webinars", params);
  }

  async getWebinarById(id) {
    return apiService.get(`/webinars/${id}`);
  }

  async getCategories() {
    return apiService.get("/webinars/categories");
  }

  async getFeaturedWebinars() {
    return apiService.get("/webinars/featured");
  }

  async registerForWebinar(webinarId, userData) {
    return apiService.post(`/webinars/${webinarId}/register`, userData);
  }

  // Admin routes
  async createWebinar(webinarData) {
    return apiService.post("/webinars", webinarData);
  }

  async updateWebinar(id, webinarData) {
    return apiService.put(`/webinars/${id}`, webinarData);
  }

  async deleteWebinar(id) {
    return apiService.delete(`/webinars/${id}`);
  }
}

export const webinarService = new WebinarService();
