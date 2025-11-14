import db from "../config/database.js";

const initializeDatabase = async () => {
  try {
    console.log("🔧 Starting database initialization...");

    // Test connection first
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();

    console.log("🔄 Creating tables if they dont exist...");

    // Books table (updated to match your schema)
    // In your initializeDatabase.js, update the books table creation:
    await db.execute(`
  CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    isbn VARCHAR(50) DEFAULT NULL,
    category VARCHAR(255) DEFAULT NULL,
    dewey_number VARCHAR(50) DEFAULT NULL,
    price DECIMAL(10,2) DEFAULT '0.00',
    format ENUM('physical','digital','both') DEFAULT 'physical',
    cover_image VARCHAR(500) DEFAULT NULL,
    file_url VARCHAR(500) DEFAULT NULL,
    file_size VARCHAR(50) DEFAULT NULL,
    pages INT DEFAULT NULL,
    publisher VARCHAR(255) DEFAULT NULL,
    published_date DATE DEFAULT NULL,
    language VARCHAR(50) DEFAULT 'English',
    tags JSON DEFAULT NULL,
    rating DECIMAL(3,2) DEFAULT '0.00',
    total_ratings INT DEFAULT '0',
    downloads INT DEFAULT '0',
    status ENUM('available','unavailable') DEFAULT 'available',
    total_copies INT DEFAULT '1',
    available_copies INT DEFAULT '1',
    featured TINYINT(1) DEFAULT '0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY isbn_unique (isbn)
  )
`);

    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user','premium','admin') DEFAULT 'user',
        affiliate_status ENUM('not_applied','pending','approved','rejected') DEFAULT 'not_applied',
        affiliate_code VARCHAR(50) DEFAULT NULL,
        total_referrals INT DEFAULT '0',
        total_earnings DECIMAL(10,2) DEFAULT '0.00',
        pending_earnings DECIMAL(10,2) DEFAULT '0.00',
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL DEFAULT NULL,
        bio TEXT,
        profile_image VARCHAR(500) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT '1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY email (email),
        UNIQUE KEY affiliate_code (affiliate_code)
      )
    `);

    // Articles table
    await db.execute(`
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
    await db.execute(`
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

    // Webinar registrations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS webinar_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        webinar_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        company VARCHAR(100) DEFAULT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_registration (webinar_id, email),
        FOREIGN KEY (webinar_id) REFERENCES webinars(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Database tables ready");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
};

export default initializeDatabase;
