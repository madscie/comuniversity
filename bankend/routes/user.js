// models/user.js
const db = require('../config/database'); // adjust this path to your DB connection
const bcrypt = require('bcryptjs');

const User = {
  // Create new user
  create: async ({ firstName, lastName, email, password, role = 'PATRON' }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, role]
    );
    return result.insertId;
  },

  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  // Verify password
  verifyPassword: async (inputPassword, hashedPassword) => {
    return bcrypt.compare(inputPassword, hashedPassword);
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Update last login timestamp
  updateLastLogin: async (id) => {
    await db.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [id]);
  },

  // Get all users
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  },

  // Delete user by ID
  deleteById: async (id) => {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = User;
