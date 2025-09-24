const { pool } = require('../config/database');

const createTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('PATRON', 'ADMIN', 'LIBRARIAN') DEFAULT 'PATRON',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    console.log('✅ Users table created/verified successfully');

    // Create default admin user if it doesn't exist
    const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@comversity.edu']);
    
    if (existingAdmin.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        ['System', 'Admin', 'admin@comversity.edu', hashedPassword, 'ADMIN']
      );
      console.log('✅ Default admin user created');
    } else {
      console.log('✅ Default admin user already exists');
    }

    // Add other tables here as needed (books, loans, etc.)
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };