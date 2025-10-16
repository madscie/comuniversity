const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration using environment variables with defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'comversity',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Log basic database info (for debugging)
console.log('Database config:', { 
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database 
});

// Create a connection pool for efficient multiple queries
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection(); // get a connection from pool
    console.log('✅ Database connected successfully');
    connection.release(); // release connection back to pool

    // Run a simple test query
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('✅ Database test query successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
};

// Export both pool and testConnection
module.exports = { pool, testConnection };
