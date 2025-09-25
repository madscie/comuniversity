const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
  // User registration
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user already exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const [result] = await db.execute(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, hashedPassword, 'PATRON']
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: result.insertId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: 'PATRON'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  },

  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists in users table
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      let user = null;
      let userType = 'user';

      // If not found in users table, check admins table
      if (users.length === 0) {
        const [admins] = await db.execute(
          'SELECT * FROM admins WHERE email = ?',
          [email]
        );

        if (admins.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        user = admins[0];
        userType = 'admin';
      } else {
        user = users[0];
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          type: userType 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Prepare user data based on user type
      const userData = userType === 'admin' 
        ? {
            id: user.id,
            first_name: user.fname,
            last_name: user.lname,
            email: user.email,
            role: 'admin',
            created_at: user.created_at
          }
        : {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
          };

      res.json({
        success: true,
        message: 'Login successful',
        user: userData,
        token: token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      let user;

      if (userType === 'admin') {
        const [admins] = await db.execute(
          'SELECT id, fname as first_name, lname as last_name, email, created_at FROM admins WHERE id = ?',
          [userId]
        );
        user = admins[0];
        user.role = 'admin';
      } else {
        const [users] = await db.execute(
          'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?',
          [userId]
        );
        user = users[0];
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: user
      });

    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching profile'
      });
    }
  }
};

module.exports = authController;