// routes/user.js
import express from "express";
import { authenticateToken, requireUser } from "../middleware/auth.js";

const router = express.Router();

// Add user-specific routes here later
router.get("/dashboard", authenticateToken, requireUser, (req, res) => {
  res.json({ message: "User dashboard data" });
});

export default router;