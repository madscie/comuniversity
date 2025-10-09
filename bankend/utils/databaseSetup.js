const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const createTables = async () => {
  try {
    console.log('🔄 Creating/verifying database tables...');

    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('PATRON','ADMIN','LIBRARIAN') DEFAULT 'PATRON',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    console.log('✅ Users table created/verified successfully');

    // Default user admin in users table
    const [existingAdmin] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@comversity.org']
    );
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.execute(
        'INSERT INTO users (first_name,last_name,email,password,role) VALUES (?,?,?,?,?)',
        ['System','Administrator','admin@comversity.org',hashedPassword,'ADMIN']
      );
      console.log('✅ Default admin user created in users table');
    } else {
      console.log('✅ Default admin user already exists in users table');
    }

    // Admins table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        fname VARCHAR(100) NOT NULL,
        lname VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password CHAR(60) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admins table created/verified successfully');

    // Default admin in admins table
    const [existingAdminUser] = await pool.execute(
      'SELECT id FROM admins WHERE username = ?',
      ['admin']
    );
    if (existingAdminUser.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.execute(
        'INSERT INTO admins (username,fname,lname,email,password) VALUES (?,?,?,?,?)',
        ['admin','System','Administrator','admin@comversity.org',hashedPassword]
      );
      console.log('✅ Default admin user created in admins table');
    } else {
      console.log('✅ Default admin user already exists in admins table');
    }

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
};

module.exports = { createTables };
