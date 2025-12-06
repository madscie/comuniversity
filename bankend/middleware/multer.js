// middleware/multer.js - COMPLETELY UPDATED VERSION
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage with separate destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    // Different folders for different file types
    if (file.fieldname === "cover_image") {
      uploadPath = path.join(__dirname, "../uploads/images");
    } else if (file.fieldname === "book_file") {
      uploadPath = path.join(__dirname, "../uploads/files");
    } else if (file.fieldname === "image") {
      // For article images
      uploadPath = path.join(__dirname, "../uploads/articles/images");
    } else if (file.fieldname === "document") {
      // For article documents
      uploadPath = path.join(__dirname, "../uploads/articles/files");
    } else {
      uploadPath = path.join(__dirname, "../uploads");
    }
    
    console.log(`📁 Multer saving ${file.fieldname} to:`, uploadPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`✅ Created directory: ${uploadPath}`);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();

    // Different naming for different file types
    let filename;
    if (file.fieldname === "cover_image") {
      filename = `book-image-${uniqueSuffix}${ext}`;
    } else if (file.fieldname === "book_file") {
      filename = `book-file-${uniqueSuffix}${ext}`;
    } else if (file.fieldname === "image") {
      filename = `article-image-${uniqueSuffix}${ext}`;
    } else if (file.fieldname === "document") {
      filename = `article-file-${uniqueSuffix}${ext}`;
    } else {
      filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    }
    
    console.log(`💾 Saving ${file.fieldname} as:`, filename);
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log(`🔍 Checking file: ${file.originalname}, type: ${file.mimetype}, field: ${file.fieldname}`);
  
  // Image files (for books and articles)
  if (file.fieldname === "cover_image" || file.fieldname === "image") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for images"), false);
    }
  }
  // Book files
  else if (file.fieldname === "book_file") {
    const allowedTypes = [
      "application/pdf",
      "application/epub+zip",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, EPUB, DOC, DOCX, and TXT files are allowed for books"), false);
    }
  }
  // Article documents
  else if (file.fieldname === "document") {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, TXT, and Excel files are allowed for articles"), false);
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