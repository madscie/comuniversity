const db = require('../config/database');

class User {
  static async create(userData) {
    const { first_name, last_name, email, password } = userData;
    const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
    const [result] = await db.promise().execute(query, [first_name, last_name, email, password]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.promise().execute(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, first_name, last_name, email, avatar_url, created_at FROM users WHERE id = ?';
    const [rows] = await db.promise().execute(query, [id]);
    return rows[0];
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await db.promise().execute(query, [id]);
  }

  static async getCount() {
  const [rows] = await db.promise().execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
  return rows[0].count;
}

static async getRecentUsers(days = 7) {
  const [rows] = await db.promise().execute(
    'SELECT * FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY created_at DESC',
    [days]
  );
  return rows;
}

}

module.exports = User;