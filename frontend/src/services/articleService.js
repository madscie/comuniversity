import { apiService } from "./apiService";

class ArticleService {
  async getArticles(params = {}) {
    return apiService.get("/articles", params);
  }

  async getArticleById(id) {
    return apiService.get(`/articles/${id}`);
  }

  async getCategories() {
    return apiService.get("/articles/categories");
  }

  async getFeaturedArticles() {
    return apiService.get("/articles/featured");
  }

  // Admin routes
  async createArticle(articleData) {
    return apiService.post("/articles", articleData);
  }

  async updateArticle(id, articleData) {
    return apiService.put(`/articles/${id}`, articleData);
  }

  async deleteArticle(id) {
    return apiService.delete(`/articles/${id}`);
  }
}

export const articleService = new ArticleService();
