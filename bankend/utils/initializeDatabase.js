// utils/initializeDatabase.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const directories = [
    'uploads',
    'uploads/images',
    'uploads/documents', 
    'uploads/webinars',
    'uploads/books'
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Initialize database tables
const initializeTables = async () => {
  try {
    console.log('🔄 Initializing database tables...');

    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'affiliate') DEFAULT 'user',
        avatar_url VARCHAR(500),
        bio TEXT,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expiry DATETIME,
        affiliate_code VARCHAR(50) UNIQUE,
        referral_count INT DEFAULT 0,
        total_earnings DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_affiliate_code (affiliate_code)
      )
    `);
    console.log('✅ Users table initialized');

    // Books table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        description TEXT,
        isbn VARCHAR(20) UNIQUE,
        category VARCHAR(100),
        dewey_number VARCHAR(50),
        price DECIMAL(10,2) DEFAULT 0.00,
        format ENUM('physical', 'ebook', 'audiobook') DEFAULT 'physical',
        cover_image VARCHAR(500),
        file_url VARCHAR(500),
        file_size INT,
        pages INT,
        publisher VARCHAR(100),
        published_date DATE,
        language VARCHAR(50) DEFAULT 'English',
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_ratings INT DEFAULT 0,
        downloads INT DEFAULT 0,
        status ENUM('available', 'checked_out', 'maintenance') DEFAULT 'available',
        total_copies INT DEFAULT 1,
        available_copies INT DEFAULT 1,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_author (author),
        INDEX idx_featured (featured)
      )
    `);
    console.log('✅ Books table initialized');

    // Articles table - FIXED SCHEMA
    await db.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        excerpt TEXT,
        author VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500),
        file_url VARCHAR(500),
        file_name VARCHAR(255),
        file_type VARCHAR(100),
        file_size INT,
        dewey_decimal VARCHAR(50),
        amount DECIMAL(10,2) DEFAULT 0.00,
        views INT DEFAULT 0,
        read_time INT DEFAULT 5,
        published_date DATE,
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        featured BOOLEAN DEFAULT FALSE,
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        INDEX idx_author (author)
      )
    `);
    console.log('✅ Articles table initialized');

    // Webinars table - FIXED SCHEMA
    await db.execute(`
      CREATE TABLE IF NOT EXISTS webinars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        speaker VARCHAR(100) NOT NULL,
        speaker_bio TEXT,
        date DATETIME NOT NULL,
        duration INT NOT NULL,
        max_attendees INT NOT NULL,
        current_attendees INT DEFAULT 0,
        join_link VARCHAR(500),
        recording_link VARCHAR(500),
        status ENUM('scheduled', 'completed', 'cancelled', 'live') DEFAULT 'scheduled',
        image_url VARCHAR(500),
        price DECIMAL(10,2) DEFAULT 0.00,
        is_premium BOOLEAN DEFAULT FALSE,
        category VARCHAR(50) DEFAULT 'Education',
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (date),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_speaker (speaker)
      )
    `);
    console.log('✅ Webinars table initialized');

    // Webinar registrations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS webinar_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        webinar_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        company VARCHAR(100),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (webinar_id) REFERENCES webinars(id) ON DELETE CASCADE,
        UNIQUE KEY unique_registration (webinar_id, email),
        INDEX idx_webinar_id (webinar_id),
        INDEX idx_email (email)
      )
    `);
    console.log('✅ Webinar registrations table initialized');

    // Add missing columns if they don't exist
    await addMissingColumns();

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Add missing columns to existing tables
const addMissingColumns = async () => {
  try {
    console.log('🔧 Checking for missing columns...');
    
    // Check and add columns to articles table
    const articlesColumns = [
      { name: 'amount', type: 'ADD COLUMN amount DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'file_url', type: 'ADD COLUMN file_url VARCHAR(500)' },
      { name: 'file_name', type: 'ADD COLUMN file_name VARCHAR(255)' },
      { name: 'file_type', type: 'ADD COLUMN file_type VARCHAR(100)' },
      { name: 'file_size', type: 'ADD COLUMN file_size INT' },
      { name: 'dewey_decimal', type: 'ADD COLUMN dewey_decimal VARCHAR(50)' }
    ];

    for (const column of articlesColumns) {
      try {
        await db.execute(`ALTER TABLE articles ${column.type}`);
        console.log(`✅ Added ${column.name} to articles table`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`✅ ${column.name} already exists in articles table`);
        } else {
          console.log(`ℹ️ ${column.name} in articles: ${error.message}`);
        }
      }
    }

    // Check and add columns to webinars table
    const webinarsColumns = [
      { name: 'image_url', type: 'ADD COLUMN image_url VARCHAR(500)' },
      { name: 'tags', type: 'ADD COLUMN tags JSON' }
    ];

    for (const column of webinarsColumns) {
      try {
        await db.execute(`ALTER TABLE webinars ${column.type}`);
        console.log(`✅ Added ${column.name} to webinars table`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`✅ ${column.name} already exists in webinars table`);
        } else {
          console.log(`ℹ️ ${column.name} in webinars: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error adding missing columns:', error);
  }
};

// Insert sample data
const insertSampleData = async () => {
  try {
    // Check if we already have data
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [books] = await db.execute('SELECT COUNT(*) as count FROM books');
    const [articles] = await db.execute('SELECT COUNT(*) as count FROM articles');
    const [webinars] = await db.execute('SELECT COUNT(*) as count FROM webinars');

    // Insert sample admin user if no users exist
    if (users[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.execute(
        'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@communiversity.com', hashedPassword, 'admin', true]
      );
      console.log('👤 Sample admin user created (email: admin@communiversity.com, password: admin123)');
    }

    // Insert sample books if no books exist
    if (books[0].count === 0) {
      const sampleBooks = [
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A classic novel of the Jazz Age',
          category: 'Literature',
          dewey_number: '813.52',
          price: 12.99,
          format: 'physical',
          pages: 180,
          publisher: 'Scribner',
          published_date: '1925-04-10',
          language: 'English',
          total_copies: 5,
          available_copies: 5
        }
      ];

      for (const book of sampleBooks) {
        await db.execute(
          `INSERT INTO books (title, author, description, category, dewey_number, price, format, pages, publisher, published_date, language, total_copies, available_copies) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            book.title, 
            book.author, 
            book.description, 
            book.category, 
            book.dewey_number, 
            book.price, 
            book.format, 
            book.pages, 
            book.publisher, 
            book.published_date, 
            book.language, 
            book.total_copies, 
            book.available_copies
          ]
        );
      }
      console.log('📚 Sample books added');
    }

    // Insert sample articles if no articles exist
    if (articles[0].count === 0) {
      const sampleArticles = [
        {
          title: 'Introduction to Modern Web Development',
          content: 'This article covers the fundamentals of modern web development including HTML, CSS, JavaScript, and popular frameworks.',
          excerpt: 'Learn the basics of web development in 2024 with this comprehensive guide.',
          author: 'Tech Writer',
          category: 'Technology',
          dewey_decimal: '005.1',
          amount: 0.00,
          read_time: 8,
          status: 'published',
          published_date: new Date().toISOString().split('T')[0]
        }
      ];

      for (const article of sampleArticles) {
        await db.execute(
          `INSERT INTO articles (title, content, excerpt, author, category, dewey_decimal, amount, read_time, status, published_date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            article.title, 
            article.content, 
            article.excerpt, 
            article.author, 
            article.category, 
            article.dewey_decimal,
            article.amount,
            article.read_time, 
            article.status, 
            article.published_date
          ]
        );
      }
      console.log('📄 Sample articles added');
    }

    // Insert sample webinars if no webinars exist
    if (webinars[0].count === 0) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const sampleWebinars = [
        {
          title: 'Introduction to React Programming',
          description: 'Learn the fundamentals of React and build your first application with hands-on examples.',
          speaker: 'John Developer',
          speaker_bio: 'Senior React Developer with 5+ years of experience',
          date: futureDate,
          duration: 90,
          max_attendees: 100,
          join_link: 'https://meet.google.com/sample-link',
          price: 0.00,
          category: 'Technology',
          status: 'scheduled'
        }
      ];

      for (const webinar of sampleWebinars) {
        await db.execute(
          `INSERT INTO webinars (title, description, speaker, speaker_bio, date, duration, max_attendees, join_link, price, category, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            webinar.title,
            webinar.description,
            webinar.speaker,
            webinar.speaker_bio,
            webinar.date,
            webinar.duration,
            webinar.max_attendees,
            webinar.join_link,
            webinar.price,
            webinar.category,
            webinar.status
          ]
        );
      }
      console.log('🎓 Sample webinars added');
    }

  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
  }
};

// Main initialization function
const initializeDatabase = async () => {
  try {
    console.log('🔧 Starting database initialization...');
    
    // Test database connection
    const [result] = await db.execute('SELECT 1');
    console.log('✅ Database connection successful');

    // Create upload directories
    createUploadDirectories();

    // Initialize tables
    await initializeTables();

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = initializeDatabase;