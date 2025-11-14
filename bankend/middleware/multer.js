// middleware/multer.js - Ensure proper configuration
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let uploadPath = path.join(__dirname, "../uploads/images");

//     // Create directory if it doesn't exist
//     const fs = require("fs");
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }

//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     // Create unique filename with timestamp
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

// middleware/multer.js - Verify the destination
// middleware/multer.js - Update the filename function
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/images");
    console.log("📁 Multer saving to:", uploadPath);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("✅ Created uploads directory");
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    // Use the same naming convention as existing files
    const filename = `image-${uniqueSuffix}${ext}`;
    console.log("💾 Saving file as:", filename);
    cb(null, filename);
  },
});
// File filter
const fileFilter = (req, file, cb) => {
  // Image files
  if (file.fieldname === "cover_image") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for cover images"), false);
    }
  }
  // Book files
  else if (file.fieldname === "book_file") {
    const allowedTypes = [
      "application/pdf",
      "application/epub+zip",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, EPUB, DOC, and DOCX files are allowed"), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export default upload;
