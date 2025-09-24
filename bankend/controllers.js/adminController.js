// // controllers/adminController.js
// const Admin = require('../models/admin'); // admins table
// const bcrypt = require('bcryptjs');
// const { generateToken } = require('../utils/tokenUtils');
// const { validationResult } = require('express-validator');

// const adminController = {
//   login: async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
//       }

//       const { email, password } = req.body;

//       const admin = await Admin.findByEmail(email);
//       if (!admin) return res.status(401).json({ success: false, message: 'Invalid email or password' });

//       const isPasswordValid = await bcrypt.compare(password, admin.password);
//       if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

//       const token = generateToken(admin.id);

//       res.json({ 
//         success: true, 
//         message: 'Admin login successful', 
//         data: { admin: { id: admin.id, username: admin.username, fname: admin.fname, lname: admin.lname, email: admin.email }, token } 
//       });
//     } catch (error) {
//       console.error('Admin login error:', error);
//       res.status(500).json({ success: false, message: 'Internal server error during admin login' });
//     }
//   }
// };

// module.exports = adminController;


// controllers/adminController.js
const Admin = require('../models/admin'); // admins table
const User = require('../models/user');   // users table
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/tokenUtils');
const { validationResult } = require('express-validator');

const adminController = {
  // Admin login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { email, password } = req.body;

      const admin = await Admin.findByEmail(email);
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(admin.id);

      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            fname: admin.fname,
            lname: admin.lname,
            email: admin.email
          },
          token
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during admin login' });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll(); // Make sure User model has a getAll() method
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ success: false, message: 'Internal server error fetching users' });
    }
  },

  // Delete a user
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const deleted = await User.deleteById(userId); // Make sure User model has deleteById()
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, message: 'Internal server error deleting user' });
    }
  }
};

module.exports = adminController;
