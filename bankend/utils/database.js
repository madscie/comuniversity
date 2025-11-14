// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'communiversity',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   acquireTimeout: 60000,
//   timeout: 60000,
//   reconnect: true
// });

// // Initialize database tables
// const initializeDatabase = async () => {
//   try {
//     // Users table
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('user', 'premium', 'admin') DEFAULT 'user',
//         affiliate_status ENUM('not_applied', 'pending', 'approved', 'rejected') DEFAULT 'not_applied',
//         affiliate_code VARCHAR(50) UNIQUE,
//         total_referrals INT DEFAULT 0,
//         total_earnings DECIMAL(10,2) DEFAULT 0,
//         pending_earnings DECIMAL(10,2) DEFAULT 0,
//         join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         last_login TIMESTAMP NULL,
//         bio TEXT,
//         profile_image VARCHAR(500),
//         is_active BOOLEAN DEFAULT TRUE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       )
//     `);

//     // Books table
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS books (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         title VARCHAR(500) NOT NULL,
//         author VARCHAR(255) NOT NULL,
//         description TEXT,
//         isbn VARCHAR(50) UNIQUE,
//         category VARCHAR(255),
//         dewey_number VARCHAR(50),
//         price DECIMAL(10,2) DEFAULT 0,
//         format ENUM('PDF', 'EPUB', 'BOTH') DEFAULT 'PDF',
//         cover_image VARCHAR(500),
//         file_url VARCHAR(500),
//         file_size VARCHAR(50),
//         pages INT,
//         publisher VARCHAR(255),
//         published_date DATE,
//         language VARCHAR(50) DEFAULT 'English',
//         tags JSON,
//         rating DECIMAL(3,2) DEFAULT 0,
//         total_ratings INT DEFAULT 0,
//         downloads INT DEFAULT 0,
//         status ENUM('available', 'unavailable') DEFAULT 'available',
//         total_copies INT DEFAULT 1,
//         available_copies INT DEFAULT 1,
//         featured BOOLEAN DEFAULT FALSE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FULLTEXT(title, author, description)
//       )
//     `);

//     // User library (purchased books)
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS user_library (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         book_id INT NOT NULL,
//         purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         purchase_price DECIMAL(10,2),
//         format VARCHAR(50),
//         download_count INT DEFAULT 0,
//         last_download TIMESTAMP NULL,
//         reading_progress INT DEFAULT 0,
//         is_favorite BOOLEAN DEFAULT FALSE,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
//         UNIQUE KEY unique_user_book (user_id, book_id)
//       )
//     `);

//     // Reading lists
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS reading_lists (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         book_id INT NOT NULL,
//         added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         progress INT DEFAULT 0,
//         notes TEXT,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
//         UNIQUE KEY unique_user_book_list (user_id, book_id)
//       )
//     `);

//     // Payments table
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS payments (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         book_id INT NOT NULL,
//         transaction_id VARCHAR(255) UNIQUE,
//         amount DECIMAL(10,2) NOT NULL,
//         currency VARCHAR(10) DEFAULT 'USD',
//         status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
//         payment_method VARCHAR(100),
//         stripe_payment_intent_id VARCHAR(255),
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP NULL,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
//       )
//     `);

//     // Downloads table
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS downloads (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         book_id INT NOT NULL,
//         download_token VARCHAR(500) UNIQUE,
//         format VARCHAR(50) NOT NULL,
//         ip_address VARCHAR(100),
//         user_agent TEXT,
//         downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         expires_at TIMESTAMP NULL,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
//       )
//     `);

//     // Affiliates table
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS affiliates (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         motivation TEXT,
//         promotion_channels JSON,
//         status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//         application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         approval_date TIMESTAMP NULL,
//         rejection_reason TEXT,
//         total_referrals INT DEFAULT 0,
//         approved_referrals INT DEFAULT 0,
//         total_earnings DECIMAL(10,2) DEFAULT 0,
//         pending_earnings DECIMAL(10,2) DEFAULT 0,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         UNIQUE KEY unique_user_affiliate (user_id)
//       )
//     `);

//     // Affiliate referrals
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS affiliate_referrals (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         affiliate_id INT NOT NULL,
//         referred_user_id INT NOT NULL,
//         referral_code VARCHAR(50) NOT NULL,
//         status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//         commission_amount DECIMAL(10,2) DEFAULT 0,
//         referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         approval_date TIMESTAMP NULL,
//         FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
//         FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
//         UNIQUE KEY unique_referral (affiliate_id, referred_user_id)
//       )
//     `);

//     // Articles table
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS articles (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         title VARCHAR(500) NOT NULL,
//         content TEXT NOT NULL,
//         excerpt TEXT,
//         author VARCHAR(255) NOT NULL,
//         category VARCHAR(255),
//         image_url VARCHAR(500),
//         status ENUM('draft', 'published') DEFAULT 'draft',
//         views INT DEFAULT 0,
//         read_time INT,
//         published_date TIMESTAMP NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FULLTEXT(title, content, excerpt)
//       )
//     `);

//     // Webinars table
//     await pool.execute(`
//       CREATE TABLE IF NOT EXISTS webinars (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         title VARCHAR(500) NOT NULL,
//         description TEXT,
//         speaker VARCHAR(255) NOT NULL,
//         date TIMESTAMP NOT NULL,
//         duration VARCHAR(100),
//         max_attendees INT,
//         current_attendees INT DEFAULT 0,
//         join_link VARCHAR(500),
//         recording_link VARCHAR(500),
//         status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
//         image_url VARCHAR(500),
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       )
//     `);

//     console.log('✅ Database tables initialized successfully');
//   } catch (error) {
//     console.error('❌ Error initializing database:', error);
//     throw error;
//   }
// };

// // Call initialize on startup
// initializeDatabase();

// module.exports = pool;
