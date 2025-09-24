// models/admin.js
const db = require('../config/database'); // Make sure this exports a mysql2/promise pool
const bcrypt = require('bcryptjs');

class Admin {
  // Find admin by email
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
    return rows[0]; // Returns the admin object or undefined
  }

  // Create new admin
  static async create({ username, fname, lname, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)`,
      [username, fname, lname, email, hashedPassword]
    );
    return result.insertId;
  }

  // Verify password
  static async verifyPassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }

  // Get admin by ID
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM admins WHERE id = ?', [id]);
    return rows[0];
  }

  // Optional: update last login timestamp
  static async updateLastLogin(id) {
    await db.execute('UPDATE admins SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }
}

module.exports = Admin;
