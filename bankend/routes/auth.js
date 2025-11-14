import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Login request:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (user.is_active !== 1) {
      return res.status(401).json({
        success: false,
        message: "Account is not active",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    };

    console.log("✅ Login successful for:", user.email);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message,
    });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const [users] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [result.insertId]
    );

    console.log("✅ User registered successfully:", users[0].email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: users[0],
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user: " + error.message,
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const mockAdminUser = {
      id: 1,
      name: "Admin User",
      email: "admin@communiversity.com",
      role: "admin",
      avatar_url: null,
    };

    res.json({
      success: true,
      data: {
        user: mockAdminUser,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
});

export default router;

// // routes/auth.js
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const db = require('../config/database');

// const router = express.Router();

// // Login route (for both regular users and admins)
// router.post('/login', async (req, res) => {
//   try {
//     console.log('📥 Login request:', req.body);

//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required'
//       });
//     }

//     console.log('🔍 Looking for user with email:', email);

//     // Find user
//     const [users] = await db.execute(
//       'SELECT * FROM users WHERE email = ?',
//       [email]
//     );

//     console.log('📊 Users found:', users.length);

//     if (users.length === 0) {
//       console.log('❌ No user found with email:', email);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     const user = users[0];
//     console.log('👤 User found:', user.email, 'Role:', user.role);

//     // Check if account is active

// if (user.is_active !== 1) {
//   console.log('❌ User account not active. is_active value:', user.is_active);
//   return res.status(401).json({
//     success: false,
//     message: 'Account is not active'
//   });
// }

//     console.log('🔐 Verifying password...');

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     console.log('✅ Password valid:', isPasswordValid);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     // Update last login
//     await db.execute(
//       'UPDATE users SET last_login = NOW() WHERE id = ?',
//       [user.id]
//     );

//     console.log('🎫 Generating JWT token...');

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user.id },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN }
//     );

//     console.log('✅ Token generated successfully');

//     // Return user data (without password)
//     const userResponse = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       avatar_url: user.avatar_url
//     };

//     console.log('✅ Login successful for:', user.email);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         token,
//         user: userResponse
//       }
//     });

//   } catch (error) {
//     console.error('❌ Login error details:', error);
//     console.error('❌ Error stack:', error.stack);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during login: ' + error.message
//     });
//   }
// });

// // Register route
// router.post('/register', async (req, res) => {
//   try {
//     console.log('📥 Register request:', req.body);

//     const { name, email, password } = req.body;

//     // Validate input
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name, email, and password are required'
//       });
//     }

//     // Check if user already exists
//     const [existingUsers] = await db.execute(
//       'SELECT id FROM users WHERE email = ?',
//       [email]
//     );

//     if (existingUsers.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this email'
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create user
//     const [result] = await db.execute(
//       'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
//       [name, email, hashedPassword]
//     );

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: result.insertId },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN }
//     );

//     // Get user data (without password)
//     const [users] = await db.execute(
//       'SELECT id, name, email, role FROM users WHERE id = ?',
//       [result.insertId]
//     );

//     console.log('✅ User registered successfully:', users[0].email);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         token,
//         user: users[0]
//       }
//     });

//   } catch (error) {
//     console.error('❌ Register error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error registering user: ' + error.message
//     });
//   }
// });

// // Get current user (temporary - no auth required for now)
// router.get('/me', async (req, res) => {
//   try {
//     // For development, return mock admin user
//     const mockAdminUser = {
//       id: 1,
//       name: 'Admin User',
//       email: 'admin@communiversity.com',
//       role: 'admin',
//       avatar_url: null
//     };

//     res.json({
//       success: true,
//       data: {
//         user: mockAdminUser
//       }
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching user data'
//     });
//   }
// });

// // Reset admin password (for development)
// router.post('/reset-admin', async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash('admin123', 12);

//     await db.execute(
//       'UPDATE users SET password = ? WHERE email = ?',
//       [hashedPassword, 'admin@communiversity.com']
//     );

//     console.log('✅ Admin password reset to: admin123');

//     res.json({
//       success: true,
//       message: 'Admin password reset to: admin123'
//     });
//   } catch (error) {
//     console.error('Reset admin password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error resetting admin password'
//     });
//   }
// });

// // Test route - check if users exist
// router.get('/test-users', async (req, res) => {
//   try {
//     const [users] = await db.execute('SELECT id, name, email, role FROM users');

//     res.json({
//       success: true,
//       data: {
//         users,
//         total: users.length
//       }
//     });
//   } catch (error) {
//     console.error('Test users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching users'
//     });
//   }
// });

// module.exports = router;
