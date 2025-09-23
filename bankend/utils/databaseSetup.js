// utils/databaseSetup.js
import bcrypt from "bcryptjs";
import { query, dbConfig } from "../config/database.js";

export const initializeDatabase = async () => {
  try {
    await createTablesIfNotExist();
    await createDefaultAdmin();
    console.log("Database initialization completed");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

const createTablesIfNotExist = async () => {
  try {
    // Create admins table
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        fname VARCHAR(100) NOT NULL,
        lname VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password CHAR(60) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE (username),
        UNIQUE (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Admins table verified");
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL DEFAULT '',
        role VARCHAR(20) NOT NULL DEFAULT 'PATRON',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY email (email),
        KEY idx_users_email (email),
        KEY idx_users_name (last_name, first_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Users table verified");
    
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

const createDefaultAdmin = async () => {
  try {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    
    await query(`
      INSERT INTO admins (username, fname, lname, email, password) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `, ["admin", "System", "Administrator", "admin@comversity.org", hashedPassword]);
    
    console.log("Default admin account verified");
  } catch (error) {
    console.error("Error creating default admin:", error);
    throw error;
  }
};