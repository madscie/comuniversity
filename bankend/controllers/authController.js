const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, join_date) VALUES (?, ?, ?, "user", NOW())',
      [name, email, hashedPassword]
    );

    const token = generateToken(result.insertId);

    // Get created user
    const [users] = await db.execute(
      'SELECT id, name, email, role, affiliate_status, affiliate_code FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute(
      'SELECT id, name, email, password, role, affiliate_status, affiliate_code, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          affiliateStatus: user.affiliate_status,
          affiliateCode: user.affiliate_code
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const [users] = await db.execute(
      'SELECT id, name, email, password, role, is_active FROM users WHERE email = ? AND role = "admin"',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Update last login
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data'
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getCurrentUser
}; // Fixed missing closing brace