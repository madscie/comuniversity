// routes/webinarRoutes.js
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
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getWebinars);
router.get("/categories", getWebinarCategories);
router.get("/health/check", getWebinarHealth);
router.get("/:id", getWebinarById);
router.post("/:id/register", registerForWebinar);

// Admin routes with file upload
router.get("/admin/all", getAdminWebinars);
router.get("/:id/registrations", getWebinarRegistrations);
router.post("/", upload.fields([{ name: 'image', maxCount: 1 }]), createWebinar);
router.put("/:id", upload.fields([{ name: 'image', maxCount: 1 }]), updateWebinar);
router.delete("/:id", deleteWebinar);

export default router;