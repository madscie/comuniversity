// routes/admin.js
import express from "express";
import { loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Admin authentication route
router.post("/login", loginAdmin);

export default router;
