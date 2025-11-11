const db = require('../utils/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const {
      name,
      email,
      password,
      role = 'user',
      affiliate_status = 'not_applied'
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role, affiliate_status) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, affiliate_status]
    );

    return this.findById(result.insertId);
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, name, email, role, affiliate_status, affiliate_code, 
              total_referrals, total_earnings, pending_earnings, join_date, 
              last_login, bio, profile_image, is_active, created_at
       FROM users WHERE id = ? AND is_active = TRUE`,
      [id]
    );
    return rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE email = ? AND is_active = TRUE`,
      [email]
    );
    return rows[0] || null;
  }

  // Update user profile
  static async update(id, updateData) {
    const allowedFields = ['name', 'bio', 'profile_image', 'last_login'];
    const fieldsToUpdate = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = updateData[key];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return this.findById(id);
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    await db.execute(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Update affiliate status
  static async updateAffiliateStatus(userId, status, code = null) {
    const updateData = { affiliate_status: status };
    if (code) {
      updateData.affiliate_code = code;
    }

    await db.execute(
      `UPDATE users SET affiliate_status = ?, affiliate_code = ? WHERE id = ?`,
      [status, code, userId]
    );

    return this.findById(userId);
  }

  // Check password
  static async checkPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user stats
  static async getUserStats(userId) {
    const [libraryStats] = await db.execute(
      `SELECT COUNT(*) as total_books, 
              SUM(reading_progress > 0 AND reading_progress < 100) as reading_in_progress,
              SUM(reading_progress = 100) as completed_books
       FROM user_library WHERE user_id = ?`,
      [userId]
    );

    const [purchaseStats] = await db.execute(
      `SELECT COUNT(*) as total_purchases, 
              SUM(purchase_price) as total_spent
       FROM user_library WHERE user_id = ? AND purchase_price > 0`,
      [userId]
    );

    return {
      totalBooks: libraryStats[0].total_books,
      readingInProgress: libraryStats[0].reading_in_progress,
      completedBooks: libraryStats[0].completed_books,
      totalPurchases: purchaseStats[0].total_purchases,
      totalSpent: purchaseStats[0].total_spent || 0
    };
  }
}

module.exports = User;