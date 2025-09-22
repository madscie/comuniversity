const Admin = require('../models/Admin');
const User = require('../models/User');
const Book = require('../models/Book');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Admin Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.getCount();
    
    // Get total books
    const totalBooks = await Book.getCount();
    
    // Get total available books
    const availableBooks = await Book.getAvailableCount();
    
    // Get recently added books (last 7 days)
    const recentBooks = await Book.getRecentBooks(7);
    
    // Get recently registered users (last 7 days)
    const recentUsers = await User.getRecentUsers(7);

    res.json({
      totalUsers,
      totalBooks,
      availableBooks,
      recentBooks: recentBooks.length,
      recentUsers: recentUsers.length,
      overview: {
        booksAddedThisWeek: recentBooks.length,
        usersRegisteredThisWeek: recentUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics.' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error while fetching user.' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, is_active } = req.body;
    
    const updated = await User.update(id, {
      first_name,
      last_name,
      email,
      is_active
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user.' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Server error while fetching admins.' });
  }
};

// Create new admin
exports.createAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fname, lname, email, username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const adminId = await Admin.create({
      fname,
      lname,
      email,
      username,
      password: hashedPassword,
      is_active: true
    });

    res.status(201).json({
      message: 'Admin created successfully.',
      id: adminId
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error while creating admin.' });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fname, lname, email, username, is_active } = req.body;
    
    const updated = await Admin.update(id, {
      fname,
      lname,
      email,
      username,
      is_active
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Admin not found.' });
    }
    
    res.json({ message: 'Admin updated successfully.' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Server error while updating admin.' });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting the current admin
    if (parseInt(id) === parseInt(req.admin.id)) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    
    const deleted = await Admin.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Admin not found.' });
    }
    
    res.json({ message: 'Admin deleted successfully.' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Server error while deleting admin.' });
  }
};

// Get borrowing statistics
exports.getBorrowingStats = async (req, res) => {
  try {
    // This would typically query your borrowing/transactions table
    // For now, return some placeholder data
    const stats = {
      totalBorrowed: 0,
      currentlyBorrowed: 0,
      overdueBooks: 0,
      popularCategories: []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching borrowing stats:', error);
    res.status(500).json({ message: 'Server error while fetching borrowing statistics.' });
  }
};

// Get system logs (placeholder - you'd implement actual logging)
exports.getSystemLogs = async (req, res) => {
  try {
    // This would query your system logs table
    const logs = [
      {
        id: 1,
        action: 'BOOK_ADDED',
        description: 'New book "Sample Book" added to library',
        timestamp: new Date().toISOString(),
        admin_id: req.admin.id,
        admin_name: req.admin.fname + ' ' + req.admin.lname
      }
    ];
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ message: 'Server error while fetching system logs.' });
  }
};