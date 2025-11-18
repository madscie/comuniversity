import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import configs
import connectDB from "./config/database.js";
import db from "./config/database.js"; // ADD THIS

// Import routes
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import articleRoutes from "./routes/articles.js";
import webinarRoutes from "./routes/webinars.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import uploadRoutes from "./routes/upload.js";

// Import database initialization
import initializeDatabase from "./utils/initializeDatabase.js";
import { connectCloudinary } from "./config/cloudinary.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== STATIC FILE SERVING ====================
console.log(
  "📁 Setting up static file serving from:",
  path.join(__dirname, "uploads")
);

// Serve files from uploads/images directory
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving static file: ${filePath}`);
    },
  })
);

// Also serve from root uploads path for backward compatibility
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ==================== DEBUG ROUTES ====================

// Debug route to check uploaded files
app.get("/api/debug/uploads", (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, "uploads/images");
    console.log("📁 Checking uploads path:", uploadsPath);

    if (!fs.existsSync(uploadsPath)) {
      return res.json({
        success: false,
        message: "Uploads directory doesn't exist",
        path: uploadsPath,
      });
    }

    const files = fs.readdirSync(uploadsPath);
    console.log("📄 Files in uploads:", files);

    res.json({
      success: true,
      path: uploadsPath,
      files: files,
      count: files.length,
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
      SELECT id, title, cover_image 
      FROM books 
      WHERE cover_image IS NOT NULL 
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        cover_image: book.cover_image,
        constructed_url: `http://localhost:5000/uploads/images/${book.cover_image
          .split("/")
          .pop()}`,
      })),
    });
  } catch (error) {
    console.error("Debug books images error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fix book images route
app.get("/api/fix-book-images", async (req, res) => {
  try {
    const [books] = await db.execute(`
      SELECT id, title, cover_image 
      FROM books 
      WHERE cover_image IS NOT NULL
    `);

    let fixedCount = 0;
    const results = [];

    for (const book of books) {
      let newCoverImage = book.cover_image;

      // If it's a full path, extract just the filename
      if (book.cover_image.includes("/")) {
        newCoverImage = book.cover_image.split("/").pop();
      }

      // If it doesn't start with image- but the file exists with image- prefix
      if (!newCoverImage.startsWith("image-")) {
        const possibleFilename = `image-${newCoverImage}`;
        const filePath = path.join(
          __dirname,
          "uploads/images",
          possibleFilename
        );
        if (fs.existsSync(filePath)) {
          newCoverImage = possibleFilename;
          console.log(`✅ Found matching file: ${possibleFilename}`);
        }
      }

      if (newCoverImage !== book.cover_image) {
        await db.execute("UPDATE books SET cover_image = ? WHERE id = ?", [
          newCoverImage,
          book.id,
        ]);
        results.push({
          id: book.id,
          title: book.title,
          old: book.cover_image,
          new: newCoverImage,
        });
        fixedCount++;
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixedCount} book image paths`,
      fixed: fixedCount,
      details: results,
    });
  } catch (error) {
    console.error("Error fixing book images:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test image serving
app.get("/api/test-image/:filename", (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, "uploads/images", filename);

  console.log("🧪 Testing image serving for:", filename);
  console.log("📁 Full path:", imagePath);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({
      success: false,
      message: "Image file not found",
      filename: filename,
      path: imagePath,
    });
  }

  res.sendFile(imagePath);
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

// Add this to server.js
app.get("/api/debug/find-matching-files", async (req, res) => {
  try {
    const [books] = await db.execute(`
      SELECT id, title, cover_image 
      FROM books 
      WHERE cover_image IS NOT NULL 
      ORDER BY id DESC
    `);

    const uploadsPath = path.join(__dirname, "uploads/images");
    const existingFiles = fs.existsSync(uploadsPath)
      ? fs.readdirSync(uploadsPath)
      : [];

    const results = books.map((book) => {
      const storedFilename = book.cover_image;
      const possibleMatches = existingFiles.filter((file) =>
        file.includes(
          storedFilename
            .replace(".jpg", "")
            .replace(".png", "")
            .replace(".jpeg", "")
        )
      );

      return {
        id: book.id,
        title: book.title,
        stored_filename: storedFilename,
        possible_matches: possibleMatches,
        file_exists: existingFiles.includes(storedFilename),
      };
    });

    res.json({
      success: true,
      results: results,
      existing_files_count: existingFiles.length,
    });
  } catch (error) {
    console.error("Debug find matching files error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add this to server.js - Proper fix for existing data
app.get("/api/fix-book-images-proper", async (req, res) => {
  try {
    const [books] = await db.execute(`
      SELECT id, title, cover_image 
      FROM books 
      WHERE cover_image IS NOT NULL
    `);

    const uploadsPath = path.join(__dirname, "uploads/images");
    const existingFiles = fs.existsSync(uploadsPath)
      ? fs.readdirSync(uploadsPath)
      : [];

    let fixedCount = 0;
    const results = [];

    for (const book of books) {
      let currentFilename = book.cover_image;
      let newFilename = null;

      // Try to find matching file in uploads directory
      for (const existingFile of existingFiles) {
        // Remove extensions for comparison
        const currentBase = currentFilename.replace(/\.[^/.]+$/, "");
        const existingBase = existingFile.replace(/\.[^/.]+$/, "");

        // Check if this existing file matches our stored filename
        if (
          existingFile.includes(currentBase) ||
          currentBase.includes(existingBase.replace("image-", ""))
        ) {
          newFilename = existingFile;
          break;
        }
      }

      // If no match found but file starts with numbers, try adding image- prefix
      if (!newFilename && /^\d+-\d+\./.test(currentFilename)) {
        const possibleFilename = `image-${currentFilename}`;
        if (existingFiles.includes(possibleFilename)) {
          newFilename = possibleFilename;
        }
      }

      // Update if we found a match
      if (newFilename && newFilename !== currentFilename) {
        await db.execute("UPDATE books SET cover_image = ? WHERE id = ?", [
          newFilename,
          book.id,
        ]);
        results.push({
          id: book.id,
          title: book.title,
          old: currentFilename,
          new: newFilename,
          status: "fixed",
        });
        fixedCount++;
      } else if (!newFilename) {
        results.push({
          id: book.id,
          title: book.title,
          old: currentFilename,
          new: "NO MATCHING FILE FOUND",
          status: "failed",
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${books.length} books. Fixed ${fixedCount}.`,
      fixed: fixedCount,
      total: books.length,
      details: results,
    });
  } catch (error) {
    console.error("Error fixing book images:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add this quick fix route for the specific mismatches
app.get("/api/quick-fix-images", async (req, res) => {
  try {
    // These are the specific fixes based on your data
    const fixes = [
      {
        id: 15,
        old: "1763118918719-404868007.jpg",
        new: "image-1763087362438-675728037.jpg",
      }, // general works
      {
        id: 22,
        old: "1763118867521-353836191.jpg",
        new: "image-1763087394362-439961738.jpg",
      }, // Surrounded by idiots
      {
        id: 23,
        old: "1763119038939-314759663.jpg",
        new: "image-1763090003202-734256639.jpg",
      }, // Surrounded by idiotsss
    ];

    const results = [];

    for (const fix of fixes) {
      const filePath = path.join(__dirname, "uploads/images", fix.new);
      if (fs.existsSync(filePath)) {
        await db.execute("UPDATE books SET cover_image = ? WHERE id = ?", [
          fix.new,
          fix.id,
        ]);
        results.push({
          id: fix.id,
          old: fix.old,
          new: fix.new,
          status: "fixed",
        });
        console.log(`✅ Fixed book ${fix.id}: ${fix.old} -> ${fix.new}`);
      } else {
        results.push({
          id: fix.id,
          old: fix.old,
          new: fix.new,
          status: "file not found",
        });
      }
    }

    res.json({
      success: true,
      message: `Applied ${
        results.filter((r) => r.status === "fixed").length
      } fixes`,
      results: results,
    });
  } catch (error) {
    console.error("Quick fix error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Debug endpoint to check all books in database
app.get("/api/debug/all-books", async (req, res) => {
  try {
    const [allBooks] = await db.execute(`
      SELECT id, title, author, status, created_at 
      FROM books 
      ORDER BY id DESC
    `);

    const [availableBooks] = await db.execute(`
      SELECT id, title, author, status, created_at 
      FROM books 
      WHERE status = 'available'
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      data: {
        totalBooks: allBooks.length,
        availableBooks: availableBooks.length,
        allBooks: allBooks,
        availableBooksList: availableBooks,
      },
    });
  } catch (error) {
    console.error("Debug books error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Temporary test route
app.get('/api/test-book-counts', async (req, res) => {
  try {
    // Count all books
    const [allCount] = await db.execute('SELECT COUNT(*) as count FROM books');
    
    // Count available books only
    const [availableCount] = await db.execute('SELECT COUNT(*) as count FROM books WHERE status = "available"');
    
    // Get lists
    const [allBooks] = await db.execute('SELECT id, title, status FROM books ORDER BY id');
    const [availableBooks] = await db.execute('SELECT id, title, status FROM books WHERE status = "available" ORDER BY id');

    res.json({
      totalBooks: allCount[0].count,
      availableBooks: availableCount[0].count,
      discrepancy: allCount[0].count - availableCount[0].count,
      allBooks: allBooks,
      availableBooks: availableBooks
    });
  } catch (error) {
    console.error('Test book counts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
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
    // Initialize database and Cloudinary
    await initializeDatabase();
    connectCloudinary();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n" + "=".repeat(50));
      console.log("🎉 SERVER STARTED ON PORT:", PORT);
      console.log("✅ Database: CONNECTED");
      console.log("☁️  Cloudinary: CONFIGURED");
      console.log("=".repeat(50));
      console.log("\n📚 Available Routes:");
      console.log("  • /api/auth - Authentication routes");
      console.log("  • /api/books - Book management routes");
      console.log("  • /api/articles - Article management routes");
      console.log("  • /api/webinars - Webinar management routes");
      console.log("  • /api/admin - Admin management routes");
      console.log("  • /api/users - User management routes");
      console.log("  • /api/debug/uploads - Debug uploads");
      console.log("  • /api/debug/books-images - Debug book images");
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
