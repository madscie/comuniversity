import express from "express";

const router = express.Router();

// User profile
router.get("/profile", (req, res) => {
  res.json({
    success: true,
    message: "User profile route - to be implemented",
  });
});

// User library
router.get("/library", (req, res) => {
  res.json({
    success: true,
    message: "User library route - to be implemented",
  });
});

// Reading list
router.get("/reading-list", (req, res) => {
  res.json({
    success: true,
    message: "Reading list route - to be implemented",
  });
});

export default router;
