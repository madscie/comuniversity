// routes/auth.js
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser
} from "../controllers/authController.js";
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors
} from "../middleware/validation.js";
import { authenticateToken, requireUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", validateUserRegistration, handleValidationErrors, registerUser);
router.post("/login", validateUserLogin, handleValidationErrors, loginUser);

// Protected routes
router.get("/profile", authenticateToken, requireUser, getUserProfile);
router.post("/logout", authenticateToken, logoutUser);

export default router;