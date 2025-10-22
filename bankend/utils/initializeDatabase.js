// utils/initializeDatabase.js
const db = require('../config/database');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...');

    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'premium', 'admin') DEFAULT 'user',
        affiliate_status ENUM('not_applied', 'pending', 'approved', 'rejected') DEFAULT 'not_applied',
        affiliate_code VARCHAR(50) UNIQUE,
        total_referrals INT DEFAULT 0,
        total_earnings DECIMAL(10,2) DEFAULT 0,
        pending_earnings DECIMAL(10,2) DEFAULT 0,
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        bio TEXT,
        profile_image VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Books table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        isbn VARCHAR(50) UNIQUE,
        category VARCHAR(255),
        dewey_number VARCHAR(50),
        price DECIMAL(10,2) DEFAULT 0,
        format ENUM('PDF', 'EPUB', 'BOTH') DEFAULT 'PDF',
        cover_image VARCHAR(500),
        file_url VARCHAR(500),
        file_size VARCHAR(50),
        pages INT,
        publisher VARCHAR(255),
        published_date DATE,
        language VARCHAR(50) DEFAULT 'English',
        tags JSON,
        rating DECIMAL(3,2) DEFAULT 0,
        total_ratings INT DEFAULT 0,
        downloads INT DEFAULT 0,
        status ENUM('available', 'unavailable') DEFAULT 'available',
        total_copies INT DEFAULT 1,
        available_copies INT DEFAULT 1,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add some sample books for testing
    const [existingBooks] = await db.execute('SELECT COUNT(*) as count FROM books');
    if (existingBooks[0].count === 0) {
      console.log('📚 Adding sample books...');
      await db.execute(`
        INSERT INTO books (title, author, description, category, price, cover_image, featured) VALUES
        ('Introduction to Computer Science', 'John Smith', 'A comprehensive introduction to computer science fundamentals.', 'General Works', 29.99, '/images/computer-science.jpg', TRUE),
        ('Psychology of Human Behavior', 'Sarah Johnson', 'Understanding the complexities of human psychology and behavior.', 'Philosophy & Psychology', 24.99, '/images/psychology.jpg', TRUE),
        ('World Religions', 'Michael Chen', 'An overview of major world religions and their beliefs.', 'Religion', 19.99, '/images/religions.jpg', FALSE),
        ('Modern Economics', 'Emma Wilson', 'Principles of modern economics and market dynamics.', 'Social Sciences', 34.99, '/images/economics.jpg', TRUE)
      `);

      // In the sample books section of initializeDatabase.js - replace the existing sample books with:
await db.execute(`
  INSERT INTO books (title, author, description, category, dewey_number, price, cover_image, featured) VALUES
  ('Introduction to Computer Science', 'John Smith', 'A comprehensive introduction to computer science fundamentals.', 'General Works', '004', 29.99, '/images/computer-science.jpg', TRUE),
  ('Psychology of Human Behavior', 'Sarah Johnson', 'Understanding the complexities of human psychology and behavior.', 'Philosophy & Psychology', '150', 24.99, '/images/psychology.jpg', TRUE),
  ('World Religions', 'Michael Chen', 'An overview of major world religions and their beliefs.', 'Religion', '200', 19.99, '/images/religions.jpg', FALSE),
  ('Modern Economics', 'Emma Wilson', 'Principles of modern economics and market dynamics.', 'Social Sciences', '330', 34.99, '/images/economics.jpg', TRUE),
  ('English Grammar Fundamentals', 'Robert Brown', 'Essential English grammar rules and usage.', 'Language', '425', 22.99, '/images/grammar.jpg', FALSE),
  ('Advanced Mathematics', 'Dr. Lisa Wang', 'Advanced mathematical concepts and theories.', 'Natural Sciences & Math', '510', 39.99, '/images/mathematics.jpg', TRUE),
  ('Medical Science Today', 'Dr. James Miller', 'Latest developments in medical science and healthcare.', 'Technology & Applied Sciences', '610', 44.99, '/images/medical.jpg', TRUE),
  ('Art History Masterpieces', 'Maria Garcia', 'Exploring the greatest masterpieces in art history.', 'Arts & Recreation', '709', 27.99, '/images/art-history.jpg', FALSE),
  ('Classic Literature Collection', 'Thomas Evans', 'A collection of timeless classic literature works.', 'Literature', '808', 19.99, '/images/literature.jpg', TRUE),
  ('World History Timeline', 'David Thompson', 'Comprehensive timeline of world history events.', 'History & Geography', '909', 31.99, '/images/history.jpg', FALSE),
  ('Children''s Science Adventures', 'Amy Roberts', 'Fun science experiments and discoveries for kids.', 'Children''s Natural Sciences & Math', 'J 500', 14.99, '/images/kids-science.jpg', TRUE),
  ('Bedtime Stories Collection', 'Susan Lee', 'Beautiful bedtime stories for young readers.', 'Children''s Literature', 'J 800', 12.99, '/images/bedtime-stories.jpg', TRUE)
`);
    }

    // Check if admin user exists, if not create one
    const [adminUsers] = await db.execute('SELECT id FROM users WHERE email = ?', ['admin@communiversity.com']);
    if (adminUsers.length === 0) {
      console.log('👨‍💼 Creating admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@communiversity.com', hashedPassword, 'admin']
      );
    }

    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

module.exports = initializeDatabase;