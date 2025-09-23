// controllers/adminController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { JWT_SECRET } from "../config/constants.js";
import { createAndSendToken } from "../utils/tokenUtils.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Demo mode - accept any password with admin@comversity.org
  if (email === "admin@comversity.org") {
    return handleDemoAdmin(res);
  }

  try {
    const admins = await query("SELECT * FROM admins WHERE email = ?", [email]);
    
    if (admins.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const admin = admins[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }
    
    createAndSendToken(admin, res, 'admin', false);
    
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const registerAdmin = async (req, res) => {
  const { username, fname, lname, email, password } = req.body;

  try {
    const existingAdmins = await query("SELECT * FROM admins WHERE email = ? OR username = ?", [email, username]);
    
    if (existingAdmins.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: "Admin with this email or username already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      "INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, fname, lname, email, hashedPassword]
    );
    
    const token = jwt.sign({ 
      id: result.insertId, 
      email: email,
      role: 'admin',
      isDemo: false
    }, JWT_SECRET, { expiresIn: "24h" });
    
    res.json({
      success: true,
      message: "Admin account created successfully",
      token,
      user: {
        id: result.insertId,
        username: username,
        email: email,
        fname: fname,
        lname: lname,
        isDemo: false
      }
    });
    
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

const handleDemoAdmin = async (res) => {
  try {
    let admins = await query("SELECT * FROM admins WHERE email = ?", ["admin@comversity.org"]);
    let admin;
    
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash("demo123", 10);
      const result = await query(
        "INSERT INTO admins (username, fname, lname, email, password) VALUES (?, ?, ?, ?, ?)",
        ["demoadmin", "Demo", "Admin", "admin@comversity.org", hashedPassword]
      );
      
      admin = {
        id: result.insertId,
        username: "demoadmin",
        email: "admin@comversity.org",
        fname: "Demo",
        lname: "Admin"
      };
    } else {
      admin = admins[0];
    }
    
    createAndSendToken(admin, res, 'admin', true);
    
  } catch (error) {
    console.error("Demo admin error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};