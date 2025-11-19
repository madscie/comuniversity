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
  updateArticleStatus,
} from "../controllers/articleController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Apply multer middleware for article creation and updates
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  createArticle
);

router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  updateArticle
);

// Public routes
router.get("/", getArticles);
router.get("/categories", getArticleCategories);
router.get("/featured", getFeaturedArticles);
router.get("/:id", getArticleById);
router.get("/:id/download", downloadArticle);

// Admin routes
router.get("/admin/all", getAdminArticles);
router.put("/:id/status", updateArticleStatus);
router.delete("/:id", deleteArticle);

export default router;
