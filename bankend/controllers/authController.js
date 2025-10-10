const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// ---------------------
// USER LOGIN (Updated with profile picture)
// ---------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with that email.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        profilePicture: user.profile_picture, // Add profile picture to response
        role: user.role || 'user',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ---------------------
// USER REGISTER (Updated with default profile picture)
// ---------------------
exports.register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, email, and password are required.',
    });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate default avatar based on name
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name + ' ' + last_name)}&background=random&color=fff&size=128`;

    // Insert new user with default profile picture
    await pool.execute(
      'INSERT INTO users (first_name, last_name, email, password, profile_picture) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword, defaultAvatar]
    );

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ---------------------
// GET USER PROFILE (New)
// ---------------------
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, profile_picture, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        profilePicture: user.profile_picture,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
};
