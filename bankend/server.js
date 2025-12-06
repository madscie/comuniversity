// server.js - COMPLETE FIXED VERSION
import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import configs
import connectDB from "./config/database.js";
import db from "./config/database.js";

// Import routes
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import articleRoutes from "./routes/articles.js";
import webinarRoutes from "./routes/webinars.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";

// Import database initialization
import initializeDatabase from "./utils/initializeDatabase.js";
import { connectCloudinary } from "./config/cloudinary.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== STATIC FILE SERVING ====================
console.log("📁 Setting up static file serving from:", path.join(__dirname, "uploads"));

// Create uploads directories if they don't exist
const createUploadsDirectories = () => {
  const directories = [
    path.join(__dirname, "uploads"),
    path.join(__dirname, "uploads/images"),
    path.join(__dirname, "uploads/files"),
    path.join(__dirname, "uploads/articles/images"),
    path.join(__dirname, "uploads/articles/files")
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

createUploadsDirectories();

// ===== CORRECT STATIC FILE SERVING PATHS =====

// 1. Serve BOOK images from /uploads/images
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving BOOK image: ${filePath}`);
    },
  })
);

// 2. Serve BOOK files from /uploads/files
app.use(
  "/uploads/files",
  express.static(path.join(__dirname, "uploads/files"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving BOOK file: ${filePath}`);
    },
  })
);

// 3. Serve ARTICLE images from /uploads/articles/images
app.use(
  "/uploads/articles/images",
  express.static(path.join(__dirname, "uploads/articles/images"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving ARTICLE image: ${filePath}`);
    },
  })
);

// 4. Serve ARTICLE files from /uploads/articles/files
app.use(
  "/uploads/articles/files",
  express.static(path.join(__dirname, "uploads/articles/files"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving ARTICLE file: ${filePath}`);
    },
  })
);

// 5. ALSO serve OLD article images from root /uploads (for backward compatibility)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving from root uploads: ${filePath}`);
    },
  })
);

// ==================== DEBUG ROUTES ====================

// Debug route to check uploaded files (all directories)
app.get("/api/debug/uploads", (req, res) => {
  try {
    console.log("📁 Checking all uploads directories:");
    
    const directories = {
      book_images: path.join(__dirname, "uploads/images"),
      book_files: path.join(__dirname, "uploads/files"),
      article_images: path.join(__dirname, "uploads/articles/images"),
      article_files: path.join(__dirname, "uploads/articles/files")
    };
    
    const results = {};
    
    for (const [name, dirPath] of Object.entries(directories)) {
      try {
        if (fs.existsSync(dirPath)) {
          results[name] = {
            path: dirPath,
            exists: true,
            files: fs.readdirSync(dirPath)
          };
          console.log(`📄 ${name}:`, results[name].files);
        } else {
          results[name] = {
            path: dirPath,
            exists: false,
            files: []
          };
        }
      } catch (error) {
        results[name] = {
          path: dirPath,
          exists: false,
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      directories: results,
    });
  } catch (error) {
    console.error("❌ Debug uploads error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Debug route to check book images in database
app.get("/api/debug/books-images", async (req, res) => {
  try {
    const [books] = await db.execute(`
      SELECT id, title, cover_image, file_url
      FROM books 
      WHERE cover_image IS NOT NULL OR file_url IS NOT NULL
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        cover_image: book.cover_image,
        file_url: book.file_url,
        image_url: book.cover_image ? `http://localhost:5000/uploads/images/${book.cover_image}` : null,
        file_url_full: book.file_url ? `http://localhost:5000/uploads/files/${book.file_url}` : null,
      })),
    });
  } catch (error) {
    console.error("Debug books images error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug route to check article files in database
app.get("/api/debug/articles-files", async (req, res) => {
  try {
    const [articles] = await db.execute(`
      SELECT id, title, image_url, file_url
      FROM articles 
      WHERE image_url IS NOT NULL OR file_url IS NOT NULL
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      articles: articles.map((article) => ({
        id: article.id,
        title: article.title,
        image_url: article.image_url,
        file_url: article.file_url,
        image_url_full: article.image_url ? `http://localhost:5000/uploads/articles/images/${article.image_url}` : null,
        file_url_full: article.file_url ? `http://localhost:5000/uploads/articles/files/${article.file_url}` : null,
      })),
    });
  } catch (error) {
    console.error("Debug articles files error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test image serving
app.get("/api/test-image/:type/:filename", (req, res) => {
  const { type, filename } = req.params;
  
  let filePath;
  if (type === 'article') {
    filePath = path.join(__dirname, "uploads/articles/images", filename);
  } else if (type === 'book') {
    filePath = path.join(__dirname, "uploads/images", filename);
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid type. Use 'article' or 'book'"
    });
  }

  console.log("🧪 Testing image serving for:", { type, filename, filePath });

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Image file not found",
      type,
      filename,
      path: filePath,
    });
  }

  res.sendFile(filePath);
});

// Test file serving
app.get("/api/test-file/:type/:filename", (req, res) => {
  const { type, filename } = req.params;
  
  let filePath;
  if (type === 'article') {
    filePath = path.join(__dirname, "uploads/articles/files", filename);
  } else if (type === 'book') {
    filePath = path.join(__dirname, "uploads/files", filename);
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid type. Use 'article' or 'book'"
    });
  }

  console.log("🧪 Testing file serving for:", { type, filename, filePath });

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
      type,
      filename,
      path: filePath,
    });
  }

  res.sendFile(filePath);
});

// Debug endpoint to check file existence
app.get("/api/debug/file-exists/:type/:filename", (req, res) => {
  const { type, filename } = req.params;
  
  let filePath;
  if (type === 'article-image') {
    filePath = path.join(__dirname, 'uploads/articles/images', filename);
  } else if (type === 'article-file') {
    filePath = path.join(__dirname, 'uploads/articles/files', filename);
  } else if (type === 'book-image') {
    filePath = path.join(__dirname, 'uploads/images', filename);
  } else if (type === 'book-file') {
    filePath = path.join(__dirname, 'uploads/files', filename);
  } else {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid type. Use: article-image, article-file, book-image, book-file' 
    });
  }
  
  const exists = fs.existsSync(filePath);
  
  const possiblePaths = [
    `/uploads/articles/images/${filename}`,
    `/uploads/articles/files/${filename}`,
    `/uploads/images/${filename}`,
    `/uploads/files/${filename}`,
    `/uploads/${filename}`
  ];
  
  res.json({
    success: true,
    filename,
    type,
    path: filePath,
    exists,
    accessible_urls: possiblePaths.map(p => `http://localhost:5000${p}`),
    actual_url: exists ? `http://localhost:5000/uploads/${type === 'article-image' ? 'articles/images' : type === 'article-file' ? 'articles/files' : type === 'book-image' ? 'images' : 'files'}/${filename}` : null
  });
});

// Test if a specific article file exists
app.get("/api/test-article-file/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [articles] = await db.execute(
      "SELECT id, title, image_url, file_url FROM articles WHERE id = ?",
      [id]
    );
    
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
    const article = articles[0];
    
    // Check if files exist
    const checks = {};
    
    if (article.image_url) {
      const imagePath = path.join(__dirname, 'uploads/articles/images', article.image_url);
      checks.image = {
        stored_path: article.image_url,
        full_path: imagePath,
        exists: fs.existsSync(imagePath),
        url: `http://localhost:5000/uploads/articles/images/${article.image_url}`
      };
    }
    
    if (article.file_url) {
      const filePath = path.join(__dirname, 'uploads/articles/files', article.file_url);
      checks.file = {
        stored_path: article.file_url,
        full_path: filePath,
        exists: fs.existsSync(filePath),
        url: `http://localhost:5000/uploads/articles/files/${article.file_url}`
      };
    }
    
    res.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        image_url: article.image_url,
        file_url: article.file_url
      },
      file_checks: checks
    });
    
  } catch (error) {
    console.error("Test article file error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test article file access
app.get("/api/test-article-file-access/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [articles] = await db.execute(
      "SELECT id, title, image_url, file_url FROM articles WHERE id = ?",
      [id]
    );
    
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
    const article = articles[0];
    
    // Construct URLs for testing
    const testUrls = {};
    
    if (article.image_url) {
      testUrls.image = {
        filename: article.image_url,
        possible_urls: [
          `http://localhost:5000/uploads/articles/images/${article.image_url}`,
          `http://localhost:5000/uploads/images/${article.image_url}`,
          `http://localhost:5000/uploads/${article.image_url}`
        ]
      };
    }
    
    if (article.file_url) {
      testUrls.file = {
        filename: article.file_url,
        possible_urls: [
          `http://localhost:5000/uploads/articles/files/${article.file_url}`,
          `http://localhost:5000/uploads/files/${article.file_url}`,
          `http://localhost:5000/uploads/${article.file_url}`
        ]
      };
    }
    
    res.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        image_url: article.image_url,
        file_url: article.file_url
      },
      test_urls: testUrls,
      message: "Try these URLs in your browser to see if files are accessible"
    });
    
  } catch (error) {
    console.error("Test article file access error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ENVIRONMENT VARIABLES VALIDATION ====================
console.log("🔧 Checking environment variables...");

const requiredEnvVars = [
  "JWT_SECRET",
  "DB_HOST", 
  "DB_USER",
  "DB_NAME",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

let allEnvVarsPresent = true;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    allEnvVarsPresent = false;
  } else {
    console.log(
      `✅ ${envVar}: ${
        envVar.includes("SECRET") || envVar.includes("KEY")
          ? "***" + process.env[envVar].slice(-4)
          : process.env[envVar]
      }`
    );
  }
}

if (!allEnvVarsPresent) {
  console.error(
    "❌ Missing required environment variables. Please check your .env file"
  );
  process.exit(1);
}

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173", 
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ==================== BASIC ROUTES ====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Communiversity API is running!",
    timestamp: new Date().toISOString(),
  });
});

// ==================== API ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/webinars", webinarRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// ==================== TEST ENDPOINTS ====================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ==================== SERVER START ====================
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Cloudinary is already configured when imported
    // Just call connectCloudinary to log confirmation
    connectCloudinary();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n" + "=".repeat(50));
      console.log("🎉 SERVER STARTED ON PORT:", PORT);
      console.log("✅ Database: CONNECTED");
      console.log("☁️  Cloudinary: CONFIGURED");
      console.log("📁 Static file serving: ENABLED");
      console.log("   • Book images: /uploads/images/");
      console.log("   • Book files: /uploads/files/");
      console.log("   • Article images: /uploads/articles/images/");
      console.log("   • Article files: /uploads/articles/files/");
      console.log("   • Root uploads: /uploads/ (backward compatibility)");
      console.log("=".repeat(50));
      console.log("\n📚 Available Routes:");
      console.log("  • /api/auth - Authentication routes");
      console.log("  • /api/books - Book management routes");
      console.log("  • /api/articles - Article management routes");
      console.log("  • /api/webinars - Webinar management routes");
      console.log("  • /api/admin - Admin management routes");
      console.log("  • /api/users - User management routes");
      console.log("\n🔧 Debug Routes:");
      console.log("  • /api/debug/uploads - Check all upload directories");
      console.log("  • /api/debug/books-images - Debug book images in DB");
      console.log("  • /api/debug/articles-files - Debug article files in DB");
      console.log("  • /api/debug/file-exists/:type/:filename - Check if file exists");
      console.log("  • /api/test-article-file/:id - Test article file access");
      console.log("  • /api/test-article-file-access/:id - Get test URLs for article");
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;