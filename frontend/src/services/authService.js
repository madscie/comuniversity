import { apiService } from "./apiService";

class AuthService {
  async login(email, password) {
    return apiService.post("/auth/login", { email, password });
  }

  async register(userData) {
    return apiService.post("/auth/register", userData);
  }

  async getCurrentUser() {
    return apiService.get("/auth/me");
  }

  async logout() {
    return apiService.post("/auth/logout");
  }

  async refreshToken() {
    return apiService.post("/auth/refresh");
  }

  async forgotPassword(email) {
    return apiService.post("/auth/forgot-password", { email });
  }

  async resetPassword(token, newPassword) {
    return apiService.post("/auth/reset-password", { token, newPassword });
  }

  async verifyEmail(token) {
    return apiService.post("/auth/verify-email", { token });
  }

  async resendVerificationEmail() {
    return apiService.post("/auth/resend-verification");
  }
}

export const authService = new AuthService();
