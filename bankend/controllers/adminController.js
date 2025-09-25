const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/tokenUtils');
const { validationResult } = require('express-validator');

const adminController = {
  // Admin login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      console.log('🔐 Admin login attempt for:', email);

      // Find admin by email
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        console.log('❌ Admin not found with email:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      console.log('✅ Admin found:', admin.email);

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        console.log('❌ Invalid password for admin:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      console.log('✅ Password valid for admin:', email);

      // Generate token
      const token = generateToken(admin.id, 'admin');

      // Return success response
      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            fname: admin.fname,
            lname: admin.lname,
            email: admin.email,
            role: 'admin'
          },
          token
        }
      });

    } catch (error) {
      console.error('💥 Admin login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error during admin login' 
      });
    }
  },

  // Get all users (placeholder)
  getAllUsers: async (req, res) => {
    try {
      res.json({ 
        success: true, 
        message: 'Get all users endpoint - implementation coming soon',
        data: [] 
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error fetching users' 
      });
    }
  },

  // Delete user (placeholder)
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      res.json({ 
        success: true, 
        message: 'Delete user endpoint - implementation coming soon',
        userId: userId
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error deleting user' 
      });
    }
  }
};

module.exports = adminController;