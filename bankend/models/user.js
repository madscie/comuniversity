const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;

const User = {
  // Find user by email
  findByEmail: async (email) => {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  },

  // Find user by ID
  findById: async (id) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  },

  // Create new user
  create: async ({ firstName, lastName, email, password, role = 'PATRON' }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const [result] = await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, hashedPassword, role]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in create user:', error);
      throw error;
    }
  },

  // Verify password
  verifyPassword: async (plainPassword, hashedPassword) => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error in verifyPassword:', error);
      throw error;
    }
  },

  // Update last login timestamp
  updateLastLogin: async (userId) => {
    try {
      await pool.query(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Error in updateLastLogin:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const [rows] = await pool.query(
        'SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      const [result] = await pool.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  },
};

module.exports = User;