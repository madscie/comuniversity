// routes/upload.js
import express from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";

const router = express.Router();

// Simple multer configuration for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Optional: Simple direct Cloudinary upload endpoint (if needed elsewhere)
router.post("/cloudinary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads",
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});

export default router;
