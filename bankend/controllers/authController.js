// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { JWT_SECRET } from "../config/constants.js";
import { createAndSendToken } from "../utils/tokenUtils.js";

// Helper to check required fields
const checkFields = (fields) => {
  return fields.every(f => f !== undefined && f !== null && f !== '');
};

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!checkFields([firstName, lastName, email, password])) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword]
    );

    const users = await query("SELECT id, first_name, last_name, email, role FROM users WHERE id = ?", [result.insertId]);

    if (users.length === 0) {
      return res.status(500).json({ success: false, message: "User created but error fetching user data" });
    }

    createAndSendToken(users[0], res, 'user', false);

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!checkFields([email, password])) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  if (email === "demo@comversity.org") {
    return handleDemoUser(res);
  }

  try {
    const users = await query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    createAndSendToken(user, res, 'user', false);

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const handleDemoUser = async (res) => {
  try {
    let users = await query("SELECT * FROM users WHERE email = ?", ["demo@comversity.org"]);
    let user;

    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash("Demo123", 10);
      const result = await query(
        "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
        ["Demo", "User", "demo@comversity.org", hashedPassword]
      );

      user = { id: result.insertId, first_name: "Demo", last_name: "User", email: "demo@comversity.org", role: "PATRON" };
    } else {
      user = users[0];
    }

    createAndSendToken(user, res, 'user', true);

  } catch (error) {
    console.error("Demo user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const users = await query("SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?", [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: users[0] });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.json({ success: true, message: "Logout successful" });
};
