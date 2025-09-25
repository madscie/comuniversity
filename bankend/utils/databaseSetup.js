// const { pool } = require('../config/database');

// const createTables = async () => {
//   try {
//     // Create users table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         first_name VARCHAR(100) NOT NULL,
//         last_name VARCHAR(100) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('PATRON', 'ADMIN', 'LIBRARIAN') DEFAULT 'PATRON',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         INDEX idx_email (email),
//         INDEX idx_role (role)
//       )
//     `);
//     console.log('✅ Users table created/verified successfully');

//     // Create default admin user if it doesn't exist
//     const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@comversity.edu']);
    
//     if (existingAdmin.length === 0) {
//       const bcrypt = require('bcryptjs');
//       const hashedPassword = await bcrypt.hash('admin123', 10);
      
//       await pool.query(
//         'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
//         ['System', 'Admin', 'admin@comversity.edu', hashedPassword, 'ADMIN']
//       );
//       console.log('✅ Default admin user created');
//     } else {
//       console.log('✅ Default admin user already exists');
//     }

//     // Add other tables here as needed (books, loans, etc.)
    
//   } catch (error) {
//     console.error('❌ Error creating tables:', error);
//     throw error;
//   }
// };

// module.exports = { createTables };

const { pool } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Creating/verifying database tables...');

    // Create users table - use execute() instead of query()
    await pool.execute(`
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

    // Create default admin user if it doesn't exist - use execute()
    const [existingAdmin] = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@comversity.edu']);
    
    if (existingAdmin.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.execute(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        ['System', 'Admin', 'admin@comversity.edu', hashedPassword, 'ADMIN']
      );
      console.log('✅ Default admin user created');
    } else {
      console.log('✅ Default admin user already exists');
    }

    // Create admins table (if you need a separate admins table)
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

    // Check if default admin exists in admins table
    const [existingAdminUser] = await pool.execute('SELECT id FROM admins WHERE email = ?', ['admin@library.org']);
    
    if (existingAdminUser.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.execute(
        'INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'Library', 'Admin', 'admin@library.org', hashedPassword]
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