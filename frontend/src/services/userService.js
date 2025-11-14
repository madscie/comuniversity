import { apiService } from "./apiService";

class UserService {
  // Get all users (admin only)
  async getUsers() {
    return apiService.get("/admin/users");
  }

  // Update user
  async updateUser(id, userData) {
    return apiService.put(`/admin/users/${id}`, userData);
  }

  // Get user profile
  async getUserProfile() {
    return apiService.get("/users/profile");
  }

  // Update user profile
  async updateUserProfile(userData) {
    return apiService.put("/users/profile", userData);
  }

  // Get affiliates
  async getAffiliates() {
    return apiService.get("/admin/affiliates");
  }

  // Update affiliate status
  async updateAffiliateStatus(id, statusData) {
    return apiService.put(`/admin/affiliates/${id}/status`, statusData);
  }

  // Apply for affiliate
  async applyForAffiliate(applicationData) {
    return apiService.post("/users/affiliate/apply", applicationData);
  }

  // Get user stats
  async getUserStats() {
    return apiService.get("/users/stats");
  }

  // Get reading history
  async getReadingHistory() {
    return apiService.get("/users/reading-history");
  }

  // Add to reading history
  async addToReadingHistory(bookId) {
    return apiService.post("/users/reading-history", { bookId });
  }
}

export const userService = new UserService();
