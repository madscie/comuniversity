// controllers/adminController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { JWT_SECRET } from "../config/constants.js";
import { createAndSendToken } from "../utils/tokenUtils.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email exists in admins table
    const admins = await query("SELECT * FROM admins WHERE email = ?", [email]);

    // If no admin found, return 401
    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const admin = admins[0];

    // Check if this is the demo admin
    if (admin.email === "admin@comversity.org") {
      // Demo admin accepts any password
      return createAndSendToken(admin, res, "admin", true);
    }

    // For normal admins, validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Send JWT token
    createAndSendToken(admin, res, "admin", false);

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
