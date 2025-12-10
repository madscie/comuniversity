import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Login request:", req.body);

    const { email, password } = req.body;
    const db = req.app.locals.db;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user in MongoDB
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.is_active) {
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

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { last_login: new Date() } }
    );

    const token = jwt.sign(
      { userId: user._id.toString() }, // Store string representation of ObjectId
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: user._id, // Return _id as id for frontend compatibility
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
    const db = req.app.locals.db;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user document
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
      is_active: true,
      avatar_url: null,
      total_referrals: 0,
      total_earnings: 0,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null
    };

    const result = await db.collection('users').insertOne(newUser);

    const token = jwt.sign(
      { userId: result.insertedId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Get created user (without password)
    const createdUser = await db.collection('users').findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } } // Exclude password from response
    );

    console.log("✅ User registered successfully:", createdUser.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role
        },
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
    // For now, return mock admin user (same as before)
    const mockAdminUser = {
      id: "507f1f77bcf86cd799439011", // Mock ObjectId string
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

// Additional routes from the commented code (converted to MongoDB):

// Reset admin password (for development)
router.post("/reset-admin", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await db.collection('users').updateOne(
      { email: 'admin@communiversity.com' },
      { $set: { password: hashedPassword } }
    );

    console.log('✅ Admin password reset to: admin123');

    res.json({
      success: true,
      message: 'Admin password reset to: admin123'
    });
  } catch (error) {
    console.error('Reset admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting admin password'
    });
  }
});

// Test route - check if users exist
router.get("/test-users", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await db.collection('users')
      .find({})
      .project({ 
        _id: 1, 
        name: 1, 
        email: 1, 
        role: 1,
        is_active: 1,
        created_at: 1 
      })
      .toArray();

    // Map _id to id for frontend compatibility
    const mappedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at
    }));

    res.json({
      success: true,
      data: {
        users: mappedUsers,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Test users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

export default router;