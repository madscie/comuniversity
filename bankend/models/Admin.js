const db = require('../config/database');

class Admin {
  // Find admin by email
  static async findByEmail(email) {
    const [rows] = await db.promise().execute('SELECT * FROM admins WHERE email = ?', [email]);
    return rows[0];
  }

  // Update last login
  static async updateLastLogin(id) {
    await db.promise().execute('UPDATE admins SET last_login = NOW() WHERE id = ?', [id]);
  }

  // Create admin
  static async create(adminData) {
    const { fname, lname, email, username, password, is_active } = adminData;
    const [result] = await db.promise().execute(
      'INSERT INTO admins (fname, lname, email, username, password, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [fname, lname, email, username, password, is_active]
    );
    return result.insertId;
  }

  // Find all admins
  static async findAll() {
    const [rows] = await db.promise().execute('SELECT * FROM admins');
    return rows;
  }

  // Find admin by ID
  static async findById(id) {
    const [rows] = await db.promise().execute('SELECT * FROM admins WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Admin;