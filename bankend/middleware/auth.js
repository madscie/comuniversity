import jwt from "jsonwebtoken";
import { getCollection } from "../config/database.js";
import { ObjectId } from "mongodb";

// Authentication middleware (updated for MongoDB)
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    // Get user from MongoDB using the userId from token
    const usersCollection = await getCollection("users");
    
    let user;
    try {
      user = await usersCollection.findOne(
        { _id: new ObjectId(decoded.userId) },
        {
          projection: {
            password: 0 // Exclude password from returned data
          }
        }
      );
    } catch (error) {
      // Handle invalid ObjectId format
      console.error("Invalid user ID format:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user account is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Add user to request object
    req.user = {
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      affiliate: user.affiliate,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    req.userId = user._id; // For backward compatibility
    
    // Log successful authentication (optional)
    console.log(`✅ Authenticated user: ${user.email} (${user.role})`);
    
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Admin authorization middleware (updated for MongoDB)
export const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    // Get user from MongoDB
    const usersCollection = await getCollection("users");
    
    let user;
    try {
      user = await usersCollection.findOne(
        { 
          _id: new ObjectId(decoded.userId),
          role: "admin" // Only find admin users
        },
        {
          projection: {
            password: 0
          }
        }
      );
    } catch (error) {
      console.error("Invalid user ID format:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Check if admin account is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    // Add user to request object
    req.user = {
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      affiliate: user.affiliate,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    req.userId = user._id;
    
    console.log(`✅ Admin authenticated: ${user.email}`);
    
    next();
  } catch (error) {
    console.error("❌ Admin middleware error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Admin authentication failed",
    });
  }
};

// Optional: Role-based middleware for different user roles
export const roleMiddleware = (roles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token required",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      
      const usersCollection = await getCollection("users");
      
      let user;
      try {
        user = await usersCollection.findOne(
          { _id: new ObjectId(decoded.userId) },
          {
            projection: {
              password: 0
            }
          }
        );
      } catch (error) {
        console.error("Invalid user ID format:", error);
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user has required role
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(", ")}`,
        });
      }

      // Check if account is active
      if (user.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      req.user = {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        affiliate: user.affiliate,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      req.userId = user._id;
      
      console.log(`✅ Role access granted: ${user.email} (${user.role})`);
      
      next();
    } catch (error) {
      console.error("❌ Role middleware error:", error.message);
      
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }
      
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }
  };
};

// Optional: Public middleware for optional authentication
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      req.userId = null;
      return next();
    }

    // Verify token if provided
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    const usersCollection = await getCollection("users");
    
    let user;
    try {
      user = await usersCollection.findOne(
        { _id: new ObjectId(decoded.userId) },
        {
          projection: {
            password: 0
          }
        }
      );
    } catch (error) {
      // Invalid token format, continue as unauthenticated
      req.user = null;
      req.userId = null;
      return next();
    }

    if (user && user.status === "active") {
      req.user = {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        affiliate: user.affiliate,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      req.userId = user._id;
      
      console.log(`✅ Optional auth: User ${user.email} authenticated`);
    } else {
      req.user = null;
      req.userId = null;
    }
    
    next();
  } catch (error) {
    // Token verification failed, continue as unauthenticated
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      req.user = null;
      req.userId = null;
      return next();
    }
    
    console.error("❌ Optional auth middleware error:", error);
    req.user = null;
    req.userId = null;
    next();
  }
};

// Refresh token middleware (if implementing token refresh)
export const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret");
    
    const usersCollection = await getCollection("users");
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) },
      {
        projection: {
          _id: 1,
          email: 1,
          role: 1,
          status: 1
        }
      }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "15m" }
    );

    // Attach new token to response
    res.locals.newAccessToken = newAccessToken;
    req.user = {
      _id: user._id,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error("❌ Refresh token middleware error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// Rate limiting middleware (optional addition)
export const rateLimitMiddleware = (requestsPerMinute = 60) => {
  const requests = new Map();
  
  return async (req, res, next) => {
    const userId = req.user?._id?.toString() || req.ip;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute ago
    
    // Clean up old requests
    if (requests.has(userId)) {
      requests.set(
        userId,
        requests.get(userId).filter(time => time > windowStart)
      );
    }
    
    const userRequests = requests.get(userId) || [];
    
    if (userRequests.length >= requestsPerMinute) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((userRequests[0] + 60000 - now) / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(userId, userRequests);
    
    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", requestsPerMinute);
    res.setHeader("X-RateLimit-Remaining", requestsPerMinute - userRequests.length);
    
    next();
  };
};

// API key authentication middleware (for external services)
export const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key required",
      });
    }

    const usersCollection = await getCollection("users");
    
    // Find user with matching API key
    const user = await usersCollection.findOne(
      { apiKey: apiKey },
      {
        projection: {
          password: 0
        }
      }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check if API key has required permissions
    if (user.apiKeyPermissions && !user.apiKeyPermissions.includes(req.method)) {
      return res.status(403).json({
        success: false,
        message: "API key does not have permission for this method",
      });
    }

    req.user = {
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      apiKey: user.apiKey,
      apiKeyPermissions: user.apiKeyPermissions
    };
    
    req.userId = user._id;
    
    console.log(`✅ API key authenticated: ${user.email}`);
    
    next();
  } catch (error) {
    console.error("❌ API key middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};