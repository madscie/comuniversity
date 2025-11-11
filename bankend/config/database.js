const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'communiversity',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🔧 Starting database initialization...');
    
    // Test connection first
    await testConnection();

    console.log('🔄 Creating tables if they dont exist...');

    // Articles table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        excerpt TEXT,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(255),
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Webinars table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS webinars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        speaker VARCHAR(255) NOT NULL,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables ready');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Initialize on startup
initializeDatabase();

// Export the pool directly
module.exports = pool;
