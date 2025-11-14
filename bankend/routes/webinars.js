import express from "express";
import {
  getWebinars,
  getWebinarById,
  getWebinarCategories,
  registerForWebinar,
  getWebinarHealth,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  getAdminWebinars,
  getWebinarRegistrations,
} from "../controllers/webinarController.js";

const router = express.Router();

// Public routes
router.get("/", getWebinars);
router.get("/categories", getWebinarCategories);
router.get("/health/check", getWebinarHealth);
router.get("/:id", getWebinarById);
router.post("/:id/register", registerForWebinar);

// Admin routes
router.get("/admin/all", getAdminWebinars);
router.get("/:id/registrations", getWebinarRegistrations);
router.post("/", createWebinar);
router.put("/:id", updateWebinar);
router.delete("/:id", deleteWebinar);

export default router;
