// routes/admin.js
import express from "express";
import {
  loginAdmin,
  registerAdmin
} from "../controllers/adminController.js";
import {
  validateAdminRegistration,
  handleValidationErrors
} from "../middleware/validation.js";

const router = express.Router();

// Admin authentication routes
router.post("/login", loginAdmin);
router.post("/register", validateAdminRegistration, handleValidationErrors, registerAdmin);

export default router;