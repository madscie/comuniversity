// middleware/auth.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Access token required" 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ 
          success: false,
          message: "Token expired" 
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          success: false,
          message: "Invalid token" 
        });
      }
      return res.status(403).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    req.user = decoded;
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: "Admin access required" 
    });
  }
  next();
};

export const requireUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ 
      success: false,
      message: "User access required" 
    });
  }
  next();
};