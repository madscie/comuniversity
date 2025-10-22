const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'communiversity',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Create promise wrapper
const db = {
  execute: (sql, params) => {
    return new Promise((resolve, reject) => {
      pool.execute(sql, params, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve([results, fields]);
        }
      });
    });
  },
  
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve([results, fields]);
        }
      });
    });
  },
  
  getConnection: () => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  }
};

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
  } else {
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  }
});

module.exports = db;