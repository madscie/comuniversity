// config/database.js
import mysql from "mysql2";

export const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "comversity",
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promise wrapper for the pool
const promisePool = pool.promise();

// Helper function for queries
export const query = async (sql, params) => {
  try {
    const [rows] = await promisePool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const connectDatabase = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection failed:", err);
      return;
    }
    console.log("Connected to Comversity database");
    connection.release();
  });
};

export { pool, promisePool };