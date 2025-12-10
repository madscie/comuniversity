import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from '../config/database.js';
import { ObjectId } from 'mongodb';

// Generate JWT Token (unchanged)
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const usersCollection = await getCollection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique user ID
    const userId = `USR-${Date.now()}`;

    // Create user document
    const userDocument = {
      userId: userId,
      name: name,
      email: email,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      
      // Affiliate system (initialize)
      affiliate: {
        code: `AFF-${Date.now().toString().slice(-6)}`,
        totalReferrals: 0,
        totalEarnings: 0,
        status: 'inactive'
      },
      
      // Library preferences
      libraryPreferences: {
        notifications: {
          dueDateReminders: true,
          newBooks: true,
          webinarAlerts: true
        }
      },
      
      // Empty arrays for embedded documents
      favorites: [],
      webinarRegistrations: [],
      currentLoans: []
    };

    // Insert user
    const result = await usersCollection.insertOne(userDocument);
    const token = generateToken(result.insertedId.toString());

    // Get created user (without password)
    const newUser = await usersCollection.findOne(
      { _id: result.insertedId },
      { 
        projection: {
          _id: 1,
          userId: 1,
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          affiliate: 1,
          createdAt: 1
        }
      }
    );

    // Transform to match your expected response format
    const transformedUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      affiliate_status: newUser.affiliate?.status || 'inactive',
      affiliate_code: newUser.affiliate?.code || null,
      join_date: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: transformedUser
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersCollection = await getCollection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active (using status field instead of is_active)
    if (user.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    const token = generateToken(user._id.toString());

    // Transform user for response
    const transformedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      affiliateStatus: user.affiliate?.status || 'inactive',
      affiliateCode: user.affiliate?.code || null,
      status: user.status
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: transformedUser
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersCollection = await getCollection('users');

    // Find admin user
    const user = await usersCollection.findOne({ 
      email: email,
      role: 'admin'
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    // Assuming req.user is set by authentication middleware
    // You'll need to update your auth middleware to use MongoDB
    
    // If req.user contains MongoDB user data, transform it
    const user = req.user;
    
    // Transform MongoDB user to match your expected format
    const transformedUser = user ? {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.status === 'active', // Convert status to boolean
      affiliate_status: user.affiliate?.status || 'inactive',
      affiliate_code: user.affiliate?.code || null,
      total_referrals: user.affiliate?.totalReferrals || 0,
      total_earnings: user.affiliate?.totalEarnings || 0,
      join_date: user.createdAt,
      last_login: user.lastLogin,
      bio: user.bio || '',
      profile_image: user.profileImage || '',
      created_at: user.createdAt,
      updated_at: user.updatedAt
    } : null;

    res.json({
      success: true,
      data: {
        user: transformedUser
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data'
    });
  }
};

// Optional: Update your auth middleware for MongoDB
// Here's a sample auth middleware update:

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const usersCollection = await getCollection('users');
    
    // Find user by ID (decoded.userId should be the string version of ObjectId)
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) },
      {
        projection: {
          password: 0 // Exclude password from returned data
        }
      }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Password reset function (optional addition)
export const resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const usersCollection = await getCollection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// Update profile function (optional addition)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, profileImage } = req.body;

    const usersCollection = await getCollection('users');

    const updateData = {
      $set: {
        updatedAt: new Date()
      }
    };

    if (name !== undefined) updateData.$set.name = name;
    if (bio !== undefined) updateData.$set.bio = bio;
    if (profileImage !== undefined) updateData.$set.profileImage = profileImage;

    await usersCollection.updateOne(
      { _id: userId },
      updateData
    );

    // Get updated user
    const updatedUser = await usersCollection.findOne(
      { _id: userId },
      {
        projection: {
          password: 0
        }
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

export default {
  register,
  login,
  adminLogin,
  getCurrentUser,
  authMiddleware,
  resetPassword,
  updateProfile
};