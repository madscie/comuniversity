// server.js - MongoDB COMPLETE FIXED VERSION
import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";

// Import configs
import { connectMongoose, testConnection } from "./config/database.js";

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

// ==================== DATABASE CONNECTION ====================
// Connect to MongoDB
let db;
try {
  console.log('🔌 Connecting to MongoDB Atlas...');
  
  // Connect using Mongoose
  const mongooseConnection = await connectMongoose();
  db = mongooseConnection.db;
  
  // Test the connection
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('MongoDB connection test failed');
  }
  
  app.locals.db = db;
  console.log("✅ MongoDB Atlas connected successfully");
} catch (error) {
  console.error("❌ MongoDB connection error:", error);
  process.exit(1);
}

// ==================== STATIC FILE SERVING ====================
console.log("📁 Setting up static file serving from:", path.join(__dirname, "uploads"));

// Create uploads directories if they don't exist
const createUploadsDirectories = () => {
  const directories = [
    path.join(__dirname, "uploads"),
    path.join(__dirname, "uploads/books/images"),
    path.join(__dirname, "uploads/books/files"),
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

// ===== FIXED STATIC FILE SERVING PATHS =====

// 1. Serve BOOK images from /uploads/books/images
app.use(
  "/uploads/books/images",
  express.static(path.join(__dirname, "uploads/books/images"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving BOOK image: ${filePath}`);
    },
  })
);

// 2. Serve BOOK files from /uploads/books/files
app.use(
  "/uploads/books/files",
  express.static(path.join(__dirname, "uploads/books/files"), {
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

// 5. Serve from root /uploads for backward compatibility (with fix for double paths)
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

// ==================== FIX FOR DOUBLE PATH ISSUE ====================
// Add middleware to handle incorrect URLs with double paths
app.use((req, res, next) => {
  // Check for double path patterns in the URL
  if (req.path.includes('//')) {
    console.log(`⚠️ Detected double path in URL: ${req.path}`);
    
    // Fix common double path patterns
    let correctedPath = req.path;
    
    // Pattern 1: /uploads/files//uploads/books/files/filename
    if (correctedPath.includes('/uploads/files//uploads/books/files/')) {
      correctedPath = correctedPath.replace('/uploads/files//uploads/books/files/', '/uploads/books/files/');
      console.log(`🔄 Pattern 1 fixed: ${req.path} -> ${correctedPath}`);
    }
    // Pattern 2: /uploads/files/uploads/books/files/filename
    else if (correctedPath.includes('/uploads/files/uploads/books/files/')) {
      correctedPath = correctedPath.replace('/uploads/files/uploads/books/files/', '/uploads/books/files/');
      console.log(`🔄 Pattern 2 fixed: ${req.path} -> ${correctedPath}`);
    }
    // Pattern 3: /uploads/books/files//uploads/books/files/filename
    else if (correctedPath.includes('/uploads/books/files//uploads/books/files/')) {
      correctedPath = correctedPath.replace('/uploads/books/files//uploads/books/files/', '/uploads/books/files/');
      console.log(`🔄 Pattern 3 fixed: ${req.path} -> ${correctedPath}`);
    }
    // Pattern 4: Any other double slash
    else {
      correctedPath = correctedPath.replace(/\/\//g, '/');
      console.log(`🔄 General double slash fixed: ${req.path} -> ${correctedPath}`);
    }
    
    // Redirect to corrected path
    return res.redirect(correctedPath);
  }
  
  next();
});

// ==================== DEBUG ROUTES ====================

// Debug route to check uploaded files (all directories)
app.get("/api/debug/uploads", (req, res) => {
  try {
    console.log("📁 Checking all uploads directories:");
    
    const directories = {
      book_images: path.join(__dirname, "uploads/books/images"),
      book_files: path.join(__dirname, "uploads/books/files"),
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

// Debug route to check collections
app.get("/api/debug/collections", async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();
    
    const collectionsInfo = await Promise.all(
      collections.map(async (collection) => {
        const count = await db.collection(collection.name).countDocuments();
        return {
          name: collection.name,
          count: count
        };
      })
    );
    
    res.json({
      success: true,
      database: db.databaseName,
      collections: collectionsInfo
    });
  } catch (error) {
    console.error("Debug collections error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug route to check book images in database
app.get("/api/debug/books-images", async (req, res) => {
  try {
    const books = await db.collection('books')
      .find({})
      .project({
        _id: 1,
        title: 1,
        coverImage: 1,
        "copies.file.url": 1
      })
      .sort({ _id: -1 })
      .toArray();

    // Extract file URLs from copies array
    const booksWithFiles = books.map((book) => {
      const fileData = book.copies?.find(c => c.file?.url)?.file;
      return {
        id: book._id,
        title: book.title,
        cover_image: book.coverImage,
        file_url: fileData?.url,
        image_url: book.coverImage ? `http://localhost:5000/uploads/books/images/${book.coverImage}` : null,
        file_url_full: fileData?.url ? `http://localhost:5000/uploads/books/files/${fileData.url}` : null,
      };
    });

    res.json({
      success: true,
      books: booksWithFiles,
    });
  } catch (error) {
    console.error("Debug books images error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug route to check article files in database
app.get("/api/debug/articles-files", async (req, res) => {
  try {
    const articles = await db.collection('articles')
      .find({
        $or: [
          { image_url: { $ne: null } },
          { file_url: { $ne: null } }
        ]
      })
      .project({
        _id: 1,
        title: 1,
        image_url: 1,
        file_url: 1
      })
      .sort({ _id: -1 })
      .toArray();

    res.json({
      success: true,
      articles: articles.map((article) => ({
        id: article._id,
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
    filePath = path.join(__dirname, "uploads/books/images", filename);
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
    filePath = path.join(__dirname, "uploads/books/files", filename);
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
  
  // Clean filename - extract just the actual filename if full path is provided
  let cleanFilename = filename;
  if (cleanFilename.includes('/')) {
    cleanFilename = cleanFilename.split('/').pop();
  }
  
  let filePath;
  if (type === 'article-image') {
    filePath = path.join(__dirname, 'uploads/articles/images', cleanFilename);
  } else if (type === 'article-file') {
    filePath = path.join(__dirname, 'uploads/articles/files', cleanFilename);
  } else if (type === 'book-image') {
    filePath = path.join(__dirname, 'uploads/books/images', cleanFilename);
  } else if (type === 'book-file') {
    filePath = path.join(__dirname, 'uploads/books/files', cleanFilename);
  } else {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid type. Use: article-image, article-file, book-image, book-file' 
    });
  }
  
  const exists = fs.existsSync(filePath);
  
  const possiblePaths = [
    `/uploads/articles/images/${cleanFilename}`,
    `/uploads/articles/files/${cleanFilename}`,
    `/uploads/books/images/${cleanFilename}`,
    `/uploads/books/files/${cleanFilename}`,
    `/uploads/${cleanFilename}`
  ];
  
  res.json({
    success: true,
    original_filename: filename,
    cleaned_filename: cleanFilename,
    path: filePath,
    exists,
    accessible_urls: possiblePaths.map(p => `http://localhost:5000${p}`),
    actual_url: exists ? `http://localhost:5000/uploads/${type === 'article-image' ? 'articles/images' : type === 'article-file' ? 'articles/files' : type === 'book-image' ? 'books/images' : 'books/files'}/${cleanFilename}` : null
  });
});

// Debug route to see what URL is being constructed for files
app.get("/api/debug/file-url/:filename", (req, res) => {
  const { filename } = req.params;
  
  // Clean the filename
  let cleanFilename = filename.replace(/^\//, '');
  
  if (cleanFilename.includes('uploads/')) {
    cleanFilename = cleanFilename.split('/').pop();
  }
  
  const bookFileUrl = `/uploads/books/files/${cleanFilename}`;
  const bookImageUrl = `/uploads/books/images/${cleanFilename}`;
  const articleFileUrl = `/uploads/articles/files/${cleanFilename}`;
  const articleImageUrl = `/uploads/articles/images/${cleanFilename}`;
  
  res.json({
    original_filename: filename,
    cleaned_filename: cleanFilename,
    generated_urls: {
      book_file: bookFileUrl,
      book_image: bookImageUrl,
      article_file: articleFileUrl,
      article_image: articleImageUrl
    },
    full_urls: {
      book_file: `http://localhost:5000${bookFileUrl}`,
      book_image: `http://localhost:5000${bookImageUrl}`,
      article_file: `http://localhost:5000${articleFileUrl}`,
      article_image: `http://localhost:5000${articleImageUrl}`
    },
    notes: "If your API returns a full path (like '/uploads/books/files/filename'), use it as-is. Don't prepend anything to it."
  });
});

// Test if a specific article file exists
app.get("/api/test-article-file/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await db.collection('articles').findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          title: 1,
          image_url: 1,
          file_url: 1
        }
      }
    );
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
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
        id: article._id,
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
    
    const article = await db.collection('articles').findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          title: 1,
          image_url: 1,
          file_url: 1
        }
      }
    );
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
    // Construct URLs for testing
    const testUrls = {};
    
    if (article.image_url) {
      testUrls.image = {
        filename: article.image_url,
        possible_urls: [
          `http://localhost:5000/uploads/articles/images/${article.image_url}`,
          `http://localhost:5000/uploads/books/images/${article.image_url}`,
          `http://localhost:5000/uploads/${article.image_url}`
        ]
      };
    }
    
    if (article.file_url) {
      testUrls.file = {
        filename: article.file_url,
        possible_urls: [
          `http://localhost:5000/uploads/articles/files/${article.file_url}`,
          `http://localhost:5000/uploads/books/files/${article.file_url}`,
          `http://localhost:5000/uploads/${article.file_url}`
        ]
      };
    }
    
    res.json({
      success: true,
      article: {
        id: article._id,
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
  "MONGODB_URI",
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
        envVar.includes("SECRET") || envVar.includes("KEY") || envVar.includes("URI")
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
    database: "MongoDB Atlas"
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
    database: "Connected to MongoDB Atlas"
  });
});

// Direct file access test endpoint
app.get("/api/test-direct-file/:filename", (req, res) => {
  const { filename } = req.params;
  
  // Clean the filename
  let cleanFilename = filename;
  if (cleanFilename.includes('/')) {
    cleanFilename = cleanFilename.split('/').pop();
  }
  
  const filePath = path.join(__dirname, 'uploads/books/files', cleanFilename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
      filename: cleanFilename,
      path: filePath
    });
  }
  
  res.sendFile(filePath);
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

// 404 handler for all other routes
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ==================== SERVER START ====================
const startServer = async () => {
  try {
    // Initialize database (seed data if needed)
    await initializeDatabase();
    
    // Cloudinary is already configured when imported
    connectCloudinary();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n" + "=".repeat(50));
      console.log("🎉 SERVER STARTED ON PORT:", PORT);
      console.log("✅ Database: MongoDB Atlas CONNECTED");
      console.log("📁 Database Name:", db.databaseName);
      console.log("☁️  Cloudinary: CONFIGURED");
      console.log("📁 Static file serving: ENABLED");
      console.log("   • Book images: /uploads/books/images/");
      console.log("   • Book files: /uploads/books/files/");
      console.log("   • Article images: /uploads/articles/images/");
      console.log("   • Article files: /uploads/articles/files/");
      console.log("   • Root uploads: /uploads/ (backward compatibility)");
      console.log("🔄 Double path fix: ACTIVE (auto-redirects incorrect URLs)");
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
      console.log("  • /api/debug/collections - List all collections");
      console.log("  • /api/debug/books-images - Debug book images in DB");
      console.log("  • /api/debug/articles-files - Debug article files in DB");
      console.log("  • /api/debug/file-exists/:type/:filename - Check if file exists");
      console.log("  • /api/debug/file-url/:filename - Debug file URL construction");
      console.log("  • /api/test-article-file/:id - Test article file access");
      console.log("  • /api/test-article-file-access/:id - Get test URLs for article");
      console.log("  • /api/test-direct-file/:filename - Direct file access test");
      
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Don't start server automatically if this file is imported
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;