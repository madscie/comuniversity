// services/articleService.js
import { apiService } from "./apiService";

class ArticleService {
  async getArticles(params = {}) {
    try {
      console.log("📄 Fetching articles with params:", params);

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

      const response = await apiService.get("/articles", cleanParams);
      console.log("📄 Articles API Response:", response);

      if (response.success) {
        const articlesData = response.data?.articles || response.data || [];
        console.log(`✅ Loaded ${articlesData.length} articles from API`);
        return response;
      } else {
        console.error("❌ Failed to load articles:", response.message);
        return { success: false, message: response.message, data: [] };
      }
    } catch (error) {
      console.error("❌ Error in getArticles:", error);
      return {
        success: false,
        message: error.message || "Failed to load articles",
        data: [],
      };
    }
  }

  async getArticleById(id) {
    try {
      const response = await apiService.get(`/articles/${id}`);
      console.log(`📖 Article ${id} API Response:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching article ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to load article",
        data: null,
      };
    }
  }

  async getCategories() {
    try {
      const response = await apiService.get("/articles/categories");
      console.log("📚 Article Categories API Response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching article categories:", error);
      return {
        success: false,
        message: error.message || "Failed to load categories",
        data: [],
      };
    }
  }

  async getFeaturedArticles() {
    try {
      const response = await apiService.get("/articles/featured");
      console.log("⭐ Featured Articles API Response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching featured articles:", error);
      return {
        success: false,
        message: error.message || "Failed to load featured articles",
        data: [],
      };
    }
  }

  // Create article with file upload capability
  async createArticle(articleData) {
    try {
      console.log("📤 Creating article with data:", articleData);

      // Use FormData if there are files, otherwise JSON
      if (articleData.imageFile || articleData.documentFile) {
        const formData = new FormData();

        // Append all article data
        Object.keys(articleData).forEach((key) => {
          if (key !== "imageFile" && key !== "documentFile") {
            formData.append(key, articleData[key]);
          }
        });

        // Append files if they exist
        if (articleData.imageFile) {
          formData.append("image", articleData.imageFile);
        }
        if (articleData.documentFile) {
          formData.append("document", articleData.documentFile);
        }

        const response = await apiService.post("/articles", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("📤 Create article response:", response);
        return response;
      }

      // Regular JSON request if no files
      const response = await apiService.post("/articles", articleData);
      console.log("📤 Create article response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating article:", error);
      return {
        success: false,
        message: error.message || "Failed to create article",
        data: null,
      };
    }
  }

  // Update article
  async updateArticle(id, articleData) {
    try {
      console.log("📤 Updating article with data:", { id, articleData });

      // Use FormData if there are files, otherwise JSON
      if (articleData.imageFile || articleData.documentFile) {
        const formData = new FormData();

        // Append all article data
        Object.keys(articleData).forEach((key) => {
          if (key !== "imageFile" && key !== "documentFile") {
            formData.append(key, articleData[key]);
          }
        });

        // Append files if they exist
        if (articleData.imageFile) {
          formData.append("image", articleData.imageFile);
        }
        if (articleData.documentFile) {
          formData.append("document", articleData.documentFile);
        }

        console.log("📁 Sending FormData with files");
        const response = await apiService.put(`/articles/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("📤 Update article response:", response);
        return response;
      }

      // Regular JSON request if no files
      console.log("📄 Sending JSON data");
      const response = await apiService.put(`/articles/${id}`, articleData);
      console.log("📤 Update article response:", response);
      return response;
    } catch (error) {
      console.error("❌ ArticleService update error:", error);
      return {
        success: false,
        message: error.message || "Failed to update article",
        data: null,
      };
    }
  }

  // Delete article
  async deleteArticle(id) {
    try {
      console.log("🗑️ Deleting article:", id);
      const response = await apiService.delete(`/articles/${id}`);
      console.log("📤 Delete article response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error deleting article:", error);
      return {
        success: false,
        message: error.message || "Failed to delete article",
        data: null,
      };
    }
  }

  // Search articles
  async searchArticles(query, params = {}) {
    try {
      const response = await apiService.get("/articles/search", {
        q: query,
        ...params,
      });
      console.log(`🔍 Search for "${query}" API Response:`, response);
      return response;
    } catch (error) {
      console.error("❌ Error searching articles:", error);
      return {
        success: false,
        message: error.message || "Search failed",
        data: [],
      };
    }
  }
}

export const articleService = new ArticleService();









