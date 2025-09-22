const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const db = require('../config/database'); // ADD THIS LINE

const generateToken = (id, type) => {
  return jwt.sign(
    { id, type }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    { expiresIn: '7d' }
  );
};

exports.registerUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(userId, 'user');

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: userId,
        first_name,
        last_name,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user.id, 'user');

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // TEMPORARY DEMO OVERRIDE - REMOVE IN PRODUCTION
    if (email === 'admin@comversity.com' || email === 'admin@library.org') {
      console.log('DEMO MODE: Bypassing password check for admin account');
      
      let admin = await Admin.findByEmail(email);
      if (!admin) {
        // Create a temporary admin record if it doesn't exist
        const query = 'INSERT INTO admins (fname, lname, email, username, password, is_active) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.promise().execute(query, [
          'Admin', 'User', email, 'admin', 'temp_password', 1
        ]);
        
        admin = {
          id: result.insertId,
          fname: 'Admin',
          lname: 'User',
          email: email,
          username: 'admin'
        };
      }

      await Admin.updateLastLogin(admin.id);
      const token = generateToken(admin.id, 'admin');

      return res.json({
        message: 'Admin login successful (demo mode).',
        token,
        admin: {
          id: admin.id,
          fname: admin.fname || 'Demo',
          lname: admin.lname || 'Admin',
          email: admin.email,
          username: admin.username || 'admin'
        }
      });
    }

    // Regular login for other admins
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    console.log('Found admin:', admin.email);
    console.log('Password hash:', admin.password?.substring(0, 30) + '...');

    // Handle different password hash formats
    let isPasswordValid = false;
    
    if (admin.password && (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'))) {
      // For bcrypt-style hashes
      isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log('BCrypt comparison result:', isPasswordValid);
    } else if (admin.password === password) {
      // Direct comparison for plain text (for testing)
      isPasswordValid = true;
      console.log('Plain text match');
    } else {
      console.log('Password does not match');
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Update last login
    await Admin.updateLastLogin(admin.id);

    // Generate token
    const token = generateToken(admin.id, 'admin');

    console.log('Login successful for:', admin.email);
    
    res.json({
      message: 'Admin login successful.',
      token,
      admin: {
        id: admin.id,
        fname: admin.fname,
        lname: admin.lname,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (req.userType === 'admin') {
      res.json({
        userType: 'admin',
        user: req.admin
      });
    } else {
      res.json({
        userType: 'user',
        user: req.user
      });
    }
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    console.log('=== ADMIN LOGIN START ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // TEMPORARY DEMO OVERRIDE - REMOVE IN PRODUCTION
    if (email === 'admin@comversity.com' || email === 'admin@library.org') {
      console.log('DEMO MODE: Bypassing password check for admin account');
      
      let admin = await Admin.findByEmail(email);
      console.log('Admin found in database:', admin);
      
      if (!admin) {
        console.log('Admin not found, creating temporary account...');
        // Create a temporary admin record if it doesn't exist
        const query = 'INSERT INTO admins (fname, lname, email, username, password, is_active) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.promise().execute(query, [
          'Admin', 'User', email, 'admin', 'temp_password', 1
        ]);
        
        admin = {
          id: result.insertId,
          fname: 'Admin',
          lname: 'User',
          email: email,
          username: 'admin'
        };
        console.log('Temporary admin created:', admin);
      }

      await Admin.updateLastLogin(admin.id);
      const token = generateToken(admin.id, 'admin');

      console.log('Login successful, sending response');
      return res.json({
        message: 'Admin login successful (demo mode).',
        token,
        admin: {
          id: admin.id,
          fname: admin.fname || 'Demo',
          lname: admin.lname || 'Admin',
          email: admin.email,
          username: admin.username || 'admin'
        }
      });
    }

    console.log('Regular admin login flow');
    // Regular login for other admins
    const admin = await Admin.findByEmail(email);
    console.log('Admin from DB:', admin);
    
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    console.log('Password validation logic...');
    // ... rest of your existing code

  } catch (error) {
    console.error('ADMIN LOGIN ERROR:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during admin login.' });
  }
};

