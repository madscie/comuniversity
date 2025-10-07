// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();

// const authRoutes = require('./routes/auth');
// const bookRoutes = require('./routes/books');

// // const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);

// // Error handling middleware
// app.use((error, req, res, next) => {
//   console.error(error);
  
//   // Handle multer errors
//   if (error.code === 'LIMIT_FILE_SIZE') {
//     return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
//   }
  
//   if (error.message === 'Only image files are allowed!') {
//     return res.status(400).json({ message: error.message });
//   }
  
//   res.status(500).json({ message: error.message || 'Server error occurred.' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });






// // server/index.js
// import express from "express";
// import mysql from "mysql";
// import cors from "cors";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Database connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "comversity"
// });

// // Connect to database
// db.connect((err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//     // Try to create database if it doesn't exist
//     createDatabaseAndTables();
//   } else {
//     console.log("Connected to Comversity database");
//     // Ensure tables exist
//     createTablesIfNotExist();
//   }
// });

// const JWT_SECRET = "your_secure_jwt_secret_key_change_in_production";

// // Function to create database if it doesn't exist
// function createDatabaseAndTables() {
//   const tempDb = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: ""
//   });

//   tempDb.connect((err) => {
//     if (err) {
//       console.error("Cannot connect to MySQL server:", err);
//       return;
//     }

//     // Create database
//     tempDb.query("CREATE DATABASE IF NOT EXISTS comversity", (err) => {
//       if (err) {
//         console.error("Error creating database:", err);
//         return;
//       }
//       console.log("Database created or already exists");

//       // Use the database
//       tempDb.query("USE comversity", (err) => {
//         if (err) {
//           console.error("Error using database:", err);
//           return;
//         }

//         // Create admins table
//         const createTableSQL = `
//           CREATE TABLE IF NOT EXISTS admins (
//             id INT NOT NULL AUTO_INCREMENT,
//             username VARCHAR(50) NOT NULL,
//             fname VARCHAR(100) NOT NULL,
//             lname VARCHAR(100) NOT NULL,
//             email VARCHAR(255) NOT NULL,
//             password CHAR(60) NOT NULL,
//             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//             PRIMARY KEY (id),
//             UNIQUE (username),
//             UNIQUE (email)
//           ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
//         `;

//         tempDb.query(createTableSQL, (err) => {
//           if (err) {
//             console.error("Error creating admins table:", err);
//             return;
//           }
//           console.log("Admins table created or already exists");

//           // Create default admin account
//           createDefaultAdmin(tempDb);
//         });
//       });
//     });
//   });
// }

// // Function to create tables if they don't exist
// function createTablesIfNotExist() {
//   const createTableSQL = `
//     CREATE TABLE IF NOT EXISTS admins (
//       id INT NOT NULL AUTO_INCREMENT,
//       username VARCHAR(50) NOT NULL,
//       fname VARCHAR(100) NOT NULL,
//       lname VARCHAR(100) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       password CHAR(60) NOT NULL,
//       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//       PRIMARY KEY (id),
//       UNIQUE (username),
//       UNIQUE (email)
//     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
//   `;

//   db.query(createTableSQL, (err) => {
//     if (err) {
//       console.error("Error creating admins table:", err);
//       return;
//     }
//     console.log("Admins table verified");
    
//     // Create default admin account
//     createDefaultAdmin(db);
//   });
// }

// // Function to create default admin account
// function createDefaultAdmin(database) {
//   const hashedPassword = bcrypt.hashSync("admin123", 10);
  
//   const insertAdminSQL = `
//     INSERT INTO admins (username, fname, lname, email, password) 
//     VALUES (?, ?, ?, ?, ?)
//     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
//   `;

//   database.query(
//     insertAdminSQL, 
//     ["admin", "System", "Administrator", "admin@communityersity.org", hashedPassword], 
//     (err) => {
//       if (err) {
//         console.error("Error creating default admin:", err);
//       } else {
//         console.log("Default admin account verified");
//       }
//     }
//   );
// }

// // Admin login endpoint
// app.post("/admin/login", async (req, res) => {
//   const { email, password } = req.body;

//   console.log("Admin login attempt for:", email);

//   // Input validation
//   if (!email || !password) {
//     return res.status(400).json({ 
//       success: false,
//       message: "Email and password are required" 
//     });
//   }

//   // Demo mode - accept any password with admin@library.org
//   if (email === "admin@library.org") {
//     console.log("Demo admin login detected");
    
//     // Check if demo admin exists in database, if not create it
//     const checkDemoSQL = "SELECT * FROM admins WHERE email = ?";
//     db.query(checkDemoSQL, [email], async (err, results) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ 
//           success: false,
//           message: "Database error" 
//         });
//       }
      
//       let admin;
      
//       if (results.length === 0) {
//         // Create demo admin if it doesn't exist
//         const hashedPassword = await bcrypt.hash("demo123", 10);
//         const createDemoSQL = "INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)";
        
//         db.query(createDemoSQL, ["demoadmin", "Demo", "Admin", email, hashedPassword], (err, result) => {
//           if (err) {
//             console.error("Error creating demo admin:", err);
//             return res.status(500).json({ 
//               success: false,
//               message: "Database error" 
//             });
//           }
          
//           admin = {
//             id: result.insertId,
//             username: "demoadmin",
//             email: email,
//             fname: "Demo",
//             lname: "Admin"
//           };
          
//           createAndSendToken(admin, res, true);
//         });
//       } else {
//         // Use existing demo admin
//         admin = results[0];
//         createAndSendToken(admin, res, true);
//       }
//     });
    
//     return;
//   }

//   // Regular admin login
//   const SQL = "SELECT * FROM admins WHERE email = ?";
//   db.query(SQL, [email], async (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return res.status(500).json({ 
//         success: false,
//         message: "Database error" 
//       });
//     }
    
//     if (results.length === 0) {
//       console.log("Admin not found:", email);
//       return res.status(401).json({ 
//         success: false,
//         message: "Invalid credentials" 
//       });
//     }

//     const admin = results[0];
    
//     // Check password (using bcrypt for security)
//     try {
//       const isPasswordValid = await bcrypt.compare(password, admin.password);
      
//       if (!isPasswordValid) {
//         console.log("Invalid password for admin:", email);
//         return res.status(401).json({ 
//           success: false,
//           message: "Invalid credentials" 
//         });
//       }
      
//       createAndSendToken(admin, res, false);
//     } catch (error) {
//       console.error("Password comparison error:", error);
//       return res.status(500).json({ 
//         success: false,
//         message: "Server error" 
//       });
//     }
//   });
// });

// // Helper function to create JWT token and send response
// function createAndSendToken(admin, res, isDemo) {
//   const token = jwt.sign({ 
//     id: admin.id, 
//     email: admin.email,
//     role: 'admin',
//     isDemo: isDemo
//   }, JWT_SECRET, { expiresIn: "24h" });
  
//   console.log("Admin login successful:", admin.email);
  
//   res.json({
//     success: true,
//     message: isDemo ? "Demo login successful" : "Login successful",
//     token,
//     user: {
//       id: admin.id,
//       username: admin.username,
//       email: admin.email,
//       fname: admin.fname,
//       lname: admin.lname,
//       isDemo: isDemo
//     }
//   });
// }

// // Health check endpoint
// app.get("/health", (req, res) => {
//   // Check database connection
//   db.query("SELECT 1", (err) => {
//     if (err) {
//       return res.status(500).json({ 
//         status: "ERROR", 
//         message: "Database connection failed",
//         error: err.message 
//       });
//     }
//     res.status(200).json({ 
//       status: "OK", 
//       message: "Server and database are running",
//       timestamp: new Date().toISOString()
//     });
//   });
// });

// const PORT = process.env.PORT || 3002;
// app.listen(PORT, () => {
//   console.log(Admin authentication server running on port ${PORT});
//   console.log(Health check available at: http://localhost:${PORT}/health);
// });

// // Handle graceful shutdown
// process.on('SIGINT', () => {
//   console.log('Shutting down server...');
//   db.end((err) => {
//     if (err) {
//       console.error('Error closing database connection:', err);
//     } else {
//       console.log('Database connection closed');
//     }
//     process.exit(0);
//   });
// });

// export default app;



//FROM MADSCIENTIST
// server/index.js (Backend)
/*import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  credentials: true
}));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "comversity"
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    createDatabaseAndTables();
  } else {
    console.log("Connected to Comversity database");
    createTablesIfNotExist();
  }
});

const JWT_SECRET = "your_secure_jwt_secret_key_change_in_production";

// Function to create database if it doesn't exist
function createDatabaseAndTables() {
  const tempDb = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
  });

  tempDb.connect((err) => {
    if (err) {
      console.error("Cannot connect to MySQL server:", err);
      return;
    }

    tempDb.query("CREATE DATABASE IF NOT EXISTS comversity", (err) => {
      if (err) {
        console.error("Error creating database:", err);
        return;
      }
      console.log("Database created or already exists");

      tempDb.query("USE comversity", (err) => {
        if (err) {
          console.error("Error using database:", err);
          return;
        }

        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS admins (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            fname VARCHAR(100) NOT NULL,
            lname VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password CHAR(60) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE (username),
            UNIQUE (email)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `;

        tempDb.query(createTableSQL, (err) => {
          if (err) {
            console.error("Error creating admins table:", err);
            return;
          }
          console.log("Admins table created or already exists");
          createDefaultAdmin(tempDb);
        });
      });
    });
  });
}

// Function to create tables if they don't exist
function createTablesIfNotExist() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT NOT NULL AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL,
      fname VARCHAR(100) NOT NULL,
      lname VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password CHAR(60) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE (username),
      UNIQUE (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  db.query(createTableSQL, (err) => {
    if (err) {
      console.error("Error creating admins table:", err);
      return;
    }
    console.log("Admins table verified");
    createDefaultAdmin(db);
  });
}

// Function to create default admin account
function createDefaultAdmin(database) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  
  const insertAdminSQL = `
    INSERT INTO admins (username, fname, lname, email, password) 
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
  `;

  database.query(
    insertAdminSQL, 
    ["admin", "System", "Administrator", "admin@communityersity.org", hashedPassword], 
    (err) => {
      if (err) {
        console.error("Error creating default admin:", err);
      } else {
        console.log("Default admin account verified");
      }
    }
  );
}

// Helper function to create JWT token and send response
function createAndSendToken(admin, res, isDemo = false) {
  const token = jwt.sign({ 
    id: admin.id, 
    email: admin.email,
    type: 'admin',
    isDemo: isDemo
  }, JWT_SECRET, { expiresIn: "24h" });
  
  console.log("Admin login successful:", admin.email);
  
  res.json({
    success: true,
    message: isDemo ? "Demo login successful" : "Login successful",
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fname: admin.fname,
      lname: admin.lname,
      isDemo: isDemo
    }
  });
}

// Admin login endpoint
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Admin login attempt for:", email);

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  // Demo mode - accept any password with admin@library.org
  if (email === "admin@library.org") {
    console.log("Demo admin login detected");
    
    const checkDemoSQL = "SELECT * FROM admins WHERE email = ?";
    db.query(checkDemoSQL, [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database error" 
        });
      }
      
      let admin;
      
      if (results.length === 0) {
        const hashedPassword = await bcrypt.hash("demo123", 10);
        const createDemoSQL = "INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)";
        
        db.query(createDemoSQL, ["demoadmin", "Demo", "Admin", email, hashedPassword], (err, result) => {
          if (err) {
            console.error("Error creating demo admin:", err);
            return res.status(500).json({ 
              success: false,
              message: "Database error" 
            });
          }
          
          admin = {
            id: result.insertId,
            username: "demoadmin",
            email: email,
            fname: "Demo",
            lname: "Admin"
          };
          
          createAndSendToken(admin, res, true);
        });
      } else {
        admin = results[0];
        createAndSendToken(admin, res, true);
      }
    });
    
    return;
  }

  // Regular admin login
  const SQL = "SELECT * FROM admins WHERE email = ?";
  db.query(SQL, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false,
        message: "Database error" 
      });
    }
    
    if (results.length === 0) {
      console.log("Admin not found:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const admin = results[0];
    
    try {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      
      if (!isPasswordValid) {
        console.log("Invalid password for admin:", email);
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }
      
      createAndSendToken(admin, res, false);
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Server error" 
      });
    }
  });
});

// Admin registration endpoint
app.post("/admin/register", async (req, res) => {
  const { username, fname, lname, email, password } = req.body;

  console.log("Admin registration attempt for:", email);

  if (!username || !fname || !lname || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: "All fields are required" 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: "Password must be at least 6 characters long" 
    });
  }

  try {
    const checkSQL = "SELECT * FROM admins WHERE email = ? OR username = ?";
    db.query(checkSQL, [email, username], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database error" 
        });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ 
          success: false,
          message: "Admin with this email or username already exists" 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const insertSQL = "INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)";
      db.query(insertSQL, [username, fname, lname, email, hashedPassword], (err, result) => {
        if (err) {
          console.error("Error creating admin:", err);
          return res.status(500).json({ 
            success: false,
            message: "Error creating admin account" 
          });
        }
        
        console.log("New admin created:", email);
        
        const token = jwt.sign({ 
          id: result.insertId, 
          email: email,
          role: 'admin',
          isDemo: false
        }, JWT_SECRET, { expiresIn: "24h" });
        
        res.json({
          success: true,
          message: "Admin account created successfully",
          token,
          user: {
            id: result.insertId,
            username: username,
            email: email,
            fname: fname,
            lname: lname,
            isDemo: false
          }
        });
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({ 
        status: "ERROR", 
        message: "Database connection failed",
        error: err.message 
      });
    }
    res.status(200).json({ 
      status: "OK", 
      message: "Server and database are running",
      timestamp: new Date().toISOString()
    });
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Admin authentication server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.end((err) => {
    if (err) {
      console.error('Error closing database connection:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});


// server/index.js (add these imports at the top)
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Add these after the imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads (add this after database connection)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const fs = require("fs");
    const uploadDir = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    if (file.fieldname === "cover_image") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for cover images"), false);
      }
    } else if (file.fieldname === "content_file") {
      const allowedTypes = [
        "application/pdf",
        "application/epub+zip",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error("Only PDF, EPUB, DOC, and DOCX files are allowed for content"),
          false
        );
      }
    } else {
      cb(null, true);
    }
  },
});

// Serve uploaded files statically (add this after middleware setup)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Add book routes (add this after your auth routes)
app.post("/api/books", upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "content_file", maxCount: 1 },
]), async (req, res) => {
  try {
    // Get form data
    const {
      title,
      author,
      isbn,
      category_id,
      description,
      total_copies,
      available_copies,
      publisher,
      published_year,
      language,
      tags,
      dewey_decimal,
      content_type,
      journal_name,
      volume,
      issue,
      pages,
      doi,
      age_group,
      reading_level,
    } = req.body;

    // Get file paths
    const cover_image = req.files["cover_image"]
      ? `/uploads/${req.files["cover_image"][0].filename}`
      : null;
    const file_url = req.files["content_file"]
      ? `/uploads/${req.files["content_file"][0].filename}`
      : null;

    // Validate required fields
    if (!title || !author || !dewey_decimal || !category_id) {
      return res.status(400).json({
        message: "Title, author, Dewey Decimal, and category are required",
      });
    }

    // Insert into database
    const query = `
      INSERT INTO books (
        title, author, isbn, category_id, description, total_copies, available_copies,
        cover_image, file_url, publisher, published_year, language, tags, dewey_decimal,
        journal_name, volume, issue, pages, doi, age_group, reading_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      author,
      isbn || null,
      category_id,
      description || null,
      parseInt(total_copies) || 1,
      parseInt(available_copies) || 1,
      cover_image,
      file_url,
      publisher || null,
      published_year || null,
      language || "English",
      tags || null,
      dewey_decimal,
      journal_name || null,
      volume || null,
      issue || null,
      pages || null,
      doi || null,
      age_group || null,
      reading_level || null,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Database error",
          error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }

      // Get the inserted book
      db.query(
        "SELECT * FROM books WHERE id = ?",
        [result.insertId],
        (err, bookResults) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              message: "Database error",
              error: process.env.NODE_ENV === "development" ? err.message : undefined,
            });
          }

          res.status(201).json({
            message: "Book added successfully",
            book: bookResults[0],
          });
        }
      );
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Add search endpoint
app.get("/api/books/search", (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchQuery = `
    SELECT * FROM books 
    WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR description LIKE ?
    ORDER BY title
  `;
  const searchValue = `%${q}%`;

  db.query(
    searchQuery,
    [searchValue, searchValue, searchValue, searchValue],
    (err, results) => {
      if (err) {
        console.error("Search error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json(results);
    }
  );
});

// Add get all books endpoint
app.get("/api/books", (req, res) => {
  const query = "SELECT * FROM books ORDER BY title";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
});

// Add to server/index.js
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});



export default app;*/




// server/index.js (Backend)
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Add these for __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "comversity"
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    createDatabaseAndTables();
  } else {
    console.log("Connected to Comversity database");
    createTablesIfNotExist();
  }
});

const JWT_SECRET = "your_secure_jwt_secret_key_change_in_production";

// Function to create database if it doesn't exist
function createDatabaseAndTables() {
  const tempDb = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
  });

  tempDb.connect((err) => {
    if (err) {
      console.error("Cannot connect to MySQL server:", err);
      return;
    }

    tempDb.query("CREATE DATABASE IF NOT EXISTS comversity", (err) => {
      if (err) {
        console.error("Error creating database:", err);
        return;
      }
      console.log("Database created or already exists");

      tempDb.query("USE comversity", (err) => {
        if (err) {
          console.error("Error using database:", err);
          return;
        }
        createAdminsTable(tempDb);
      });
    });
  });
}

// Function to create admins table
function createAdminsTable(database) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT NOT NULL AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL,
      fname VARCHAR(100) NOT NULL,
      lname VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password CHAR(60) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE (username),
      UNIQUE (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  database.query(createTableSQL, (err) => {
    if (err) {
      console.error("Error creating admins table:", err);
      return;
    }
    console.log("Admins table created or already exists");
    createBooksTable(database);
    createDefaultAdmin(database);
  });
}

// Function to create books table - UPDATED to match your actual structure
function createBooksTable(database) {
  const createBooksTableSQL = `
    CREATE TABLE IF NOT EXISTS books (
      id INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      isbn VARCHAR(20),
      category_id INT,
      description TEXT,
      total_copies INT DEFAULT 1,
      available_copies INT DEFAULT 1,
      cover_image VARCHAR(500),
      file_url VARCHAR(500),
      publisher VARCHAR(255),
      published_year INT,
      language VARCHAR(50) DEFAULT 'English',
      tags TEXT,
      dewey_decimal VARCHAR(50),
      content_type VARCHAR(50) DEFAULT 'book',
      journal_name VARCHAR(255),
      volume VARCHAR(50),
      issue VARCHAR(50),
      pages VARCHAR(50),
      doi VARCHAR(100),
      age_group VARCHAR(50),
      reading_level VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  database.query(createBooksTableSQL, (err) => {
    if (err) {
      console.error("Error creating books table:", err);
    } else {
      console.log("Books table verified");
    }
  });
}

// Function to create tables if they don't exist
function createTablesIfNotExist() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT NOT NULL AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL,
      fname VARCHAR(100) NOT NULL,
      lname VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password CHAR(60) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE (username),
      UNIQUE (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  db.query(createTableSQL, (err) => {
    if (err) {
      console.error("Error creating admins table:", err);
      return;
    }
    console.log("Admins table verified");
    createBooksTable(db);
    createDefaultAdmin(db);
  });
}

// Function to create default admin account
function createDefaultAdmin(database) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  
  const insertAdminSQL = `
    INSERT INTO admins (username, fname, lname, email, password) 
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
  `;

  database.query(
    insertAdminSQL, 
    ["admin", "System", "Administrator", "admin@communityersity.org", hashedPassword], 
    (err) => {
      if (err) {
        console.error("Error creating default admin:", err);
      } else {
        console.log("Default admin account verified");
      }
    }
  );
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "cover_image") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for cover images"), false);
      }
    } else if (file.fieldname === "content_file") {
      const allowedTypes = [
        "application/pdf",
        "application/epub+zip",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error("Only PDF, EPUB, DOC, and DOCX files are allowed for content"),
          false
        );
      }
    } else {
      cb(null, true);
    }
  },
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Helper function to create JWT token and send response
function createAndSendToken(admin, res, isDemo = false) {
  const token = jwt.sign({ 
    id: admin.id, 
    email: admin.email,
    type: 'admin',
    isDemo: isDemo
  }, JWT_SECRET, { expiresIn: "24h" });
  
  console.log("Admin login successful:", admin.email);
  
  res.json({
    success: true,
    message: isDemo ? "Demo login successful" : "Login successful",
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fname: admin.fname,
      lname: admin.lname,
      isDemo: isDemo
    }
  });
}

// ==================== AUTH ROUTES ====================

// Admin login endpoint
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Admin login attempt for:", email);

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  if (email === "admin@library.org") {
    console.log("Demo admin login detected");
    
    const checkDemoSQL = "SELECT * FROM admins WHERE email = ?";
    db.query(checkDemoSQL, [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database error" 
        });
      }
      
      let admin;
      
      if (results.length === 0) {
        const hashedPassword = await bcrypt.hash("demo123", 10);
        const createDemoSQL = "INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)";
        
        db.query(createDemoSQL, ["demoadmin", "Demo", "Admin", email, hashedPassword], (err, result) => {
          if (err) {
            console.error("Error creating demo admin:", err);
            return res.status(500).json({ 
              success: false,
              message: "Database error" 
            });
          }
          
          admin = {
            id: result.insertId,
            username: "demoadmin",
            email: email,
            fname: "Demo",
            lname: "Admin"
          };
          
          createAndSendToken(admin, res, true);
        });
      } else {
        admin = results[0];
        createAndSendToken(admin, res, true);
      }
    });
    
    return;
  }

  const SQL = "SELECT * FROM admins WHERE email = ?";
  db.query(SQL, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false,
        message: "Database error" 
      });
    }
    
    if (results.length === 0) {
      console.log("Admin not found:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const admin = results[0];
    
    try {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      
      if (!isPasswordValid) {
        console.log("Invalid password for admin:", email);
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }
      
      createAndSendToken(admin, res, false);
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Server error" 
      });
    }
  });
});

// ==================== BOOK ROUTES ====================

// Create new book - UPDATED to use category_id
app.post("/api/books", upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "content_file", maxCount: 1 },
]), async (req, res) => {
  try {
    console.log("Book upload request received");
    console.log("Request body:", req.body);

    const {
      title,
      author,
      isbn,
      category,
      description,
      total_copies,
      available_copies,
      publisher,
      published_year,
      language,
      tags,
      dewey_decimal,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: "Title and author are required",
      });
    }

    // Map category name to category_id (simple mapping)
    const categoryMap = {
      'Arts': 1,
      'Science': 2, 
      'Technology': 3,
      'Fiction': 4,
      'History': 5,
      'Literature': 6,
      'Mathematics': 7,
      'Physics': 8,
      'Chemistry': 9,
      'Biology': 10
    };
    
    const category_id = categoryMap[category] || 1; // Default to 1 if not found

    const cover_image = req.files?.["cover_image"]?.[0]
      ? `/uploads/${req.files["cover_image"][0].filename}`
      : null;
    const file_url = req.files?.["content_file"]?.[0]
      ? `/uploads/${req.files["content_file"][0].filename}`
      : null;

    const query = `
      INSERT INTO books (
        title, author, isbn, category_id, description, total_copies, available_copies,
        cover_image, file_url, publisher, published_year, language, tags, dewey_decimal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      author,
      isbn || null,
      category_id,
      description || "",
      parseInt(total_copies) || 1,
      parseInt(available_copies) || 1,
      cover_image,
      file_url,
      publisher || "",
      published_year ? parseInt(published_year) : null,
      language || "English",
      tags || "",
      dewey_decimal || "",
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      db.query(
        "SELECT * FROM books WHERE id = ?",
        [result.insertId],
        (err, bookResults) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              message: "Database error",
              error: err.message,
            });
          }

          console.log("Book created successfully:", result.insertId);
          res.status(201).json({
            success: true,
            message: "Book added successfully",
            book: bookResults[0],
          });
        }
      );
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all books
app.get("/api/books", (req, res) => {
  const query = "SELECT * FROM books ORDER BY created_at DESC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false,
        message: "Database error" 
      });
    }

    res.json(results);
  });
});

// Get book by ID
app.get("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
  const query = "SELECT * FROM books WHERE id = ?";
  
  db.query(query, [bookId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false,
        message: "Database error" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    res.json(results[0]);
  });
});

// UPDATE BOOK - FIXED to use category_id instead of category
app.put("/api/books/:id", upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "content_file", maxCount: 1 },
]), async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("Updating book ID:", bookId);
    console.log("Request body:", req.body);

    // Check if book exists
    const bookCheck = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM books WHERE id = ?", [bookId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (bookCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    const {
      title,
      author,
      isbn,
      category,
      description,
      total_copies,
      available_copies,
      publisher,
      published_year,
      language
    } = req.body;

    // Map category name to category_id
    const categoryMap = {
      'Arts': 1,
      'Science': 2, 
      'Technology': 3,
      'Fiction': 4,
      'History': 5,
      'Literature': 6,
      'Mathematics': 7,
      'Physics': 8,
      'Chemistry': 9,
      'Biology': 10
    };
    
    const category_id = category ? (categoryMap[category] || 1) : undefined;

    let updateFields = [];
    let updateValues = [];

    // Add fields that are provided
    if (title !== undefined) { 
      updateFields.push("title = ?"); 
      updateValues.push(title); 
    }
    if (author !== undefined) { 
      updateFields.push("author = ?"); 
      updateValues.push(author); 
    }
    if (isbn !== undefined) { 
      updateFields.push("isbn = ?"); 
      updateValues.push(isbn); 
    }
    if (category_id !== undefined) { 
      updateFields.push("category_id = ?"); 
      updateValues.push(category_id); 
    }
    if (description !== undefined) { 
      updateFields.push("description = ?"); 
      updateValues.push(description); 
    }
    if (total_copies !== undefined) { 
      updateFields.push("total_copies = ?"); 
      updateValues.push(parseInt(total_copies)); 
    }
    if (available_copies !== undefined) { 
      updateFields.push("available_copies = ?"); 
      updateValues.push(parseInt(available_copies)); 
    }
    if (publisher !== undefined) { 
      updateFields.push("publisher = ?"); 
      updateValues.push(publisher); 
    }
    if (published_year !== undefined) { 
      updateFields.push("published_year = ?"); 
      updateValues.push(published_year ? parseInt(published_year) : null); 
    }
    if (language !== undefined) { 
      updateFields.push("language = ?"); 
      updateValues.push(language); 
    }

    // Handle file uploads
    if (req.files?.["cover_image"]?.[0]) {
      const cover_image = `/uploads/${req.files["cover_image"][0].filename}`;
      updateFields.push("cover_image = ?");
      updateValues.push(cover_image);
    }

    if (req.files?.["content_file"]?.[0]) {
      const file_url = `/uploads/${req.files["content_file"][0].filename}`;
      updateFields.push("file_url = ?");
      updateValues.push(file_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    console.log("Update fields:", updateFields);
    console.log("Update values:", updateValues);

    // Add book ID to values
    updateValues.push(bookId);

    const updateQuery = `UPDATE books SET ${updateFields.join(", ")} WHERE id = ?`;

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Book not found or no changes made"
        });
      }

      // Get the updated book
      db.query("SELECT * FROM books WHERE id = ?", [bookId], (err, bookResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
          });
        }

        console.log("Book updated successfully:", bookId);
        res.json({
          success: true,
          message: "Book updated successfully",
          book: bookResults[0]
        });
      });
    });

  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Delete book
app.delete("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
  
  db.query("SELECT * FROM books WHERE id = ?", [bookId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    db.query("DELETE FROM books WHERE id = ?", [bookId], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      console.log("Book deleted successfully:", bookId);
      res.json({
        success: true,
        message: "Book deleted successfully"
      });
    });
  });
});

// Search books
app.get("/api/books/search", (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      success: false,
      message: "Search query is required" 
    });
  }

  const searchQuery = `
    SELECT * FROM books 
    WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR description LIKE ?
    ORDER BY title
  `;
  const searchValue = `%${q}%`;

  db.query(
    searchQuery,
    [searchValue, searchValue, searchValue, searchValue],
    (err, results) => {
      if (err) {
        console.error("Search error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database error" 
        });
      }

      res.json(results);
    }
  );
});

// ==================== UTILITY ROUTES ====================

// Debug table structure
app.get("/api/debug/table-structure", (req, res) => {
  const query = "DESCRIBE books";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error describing table:", err);
      return res.status(500).json({ 
        success: false,
        message: "Database error",
        error: err.message
      });
    }
    
    res.json({
      tableStructure: results,
      columns: results.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }))
    });
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({ 
        status: "ERROR", 
        message: "Database connection failed",
        error: err.message 
      });
    }
    res.status(200).json({ 
      status: "OK", 
      message: "Server and database are running",
      timestamp: new Date().toISOString()
    });
  });
});

// API test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true,
    message: "API is working!", 
    timestamp: new Date().toISOString() 
  });
});

// Debug routes endpoint
app.get("/api/books/debug/routes", (req, res) => {
  res.json({
    availableRoutes: [
      'POST /api/books',
      'GET /api/books', 
      'GET /api/books/:id',
      'PUT /api/books/:id',
      'DELETE /api/books/:id',
      'GET /api/books/search',
      'GET /api/books/debug/routes',
      'GET /api/debug/table-structure'
    ],
    message: 'PUT route is now available for editing books'
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API test: http://localhost:${PORT}/api/test`);
  console.log(`Debug routes: http://localhost:${PORT}/api/books/debug/routes`);
  console.log(`Table structure: http://localhost:${PORT}/api/debug/table-structure`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.end((err) => {
    if (err) {
      console.error('Error closing database connection:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

export default app;