import express from "express";
import {
  getArticles,
  getArticleById,
  getArticleCategories,
  getFeaturedArticles,
  downloadArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getAdminArticles,
} from "../controllers/articleController.js";

const router = express.Router();

// Public routes
router.get("/", getArticles);
router.get("/categories", getArticleCategories);
router.get("/featured/all", getFeaturedArticles);
router.get("/:id", getArticleById);
router.get("/:id/download", downloadArticle);

// Admin routes
router.get("/admin/all", getAdminArticles);
router.post("/", createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

export default router;
