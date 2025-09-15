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
//   console.log(`Admin authentication server running on port ${PORT}`);
//   console.log(`Health check available at: http://localhost:${PORT}/health`);
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




// server/index.js (Backend)
import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
app.use(cors());

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
    role: 'admin',
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

export default app;