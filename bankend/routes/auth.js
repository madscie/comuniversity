const express = require('express');
const { body } = require('express-validator');
const { 
  registerUser, 
  loginUser, 
  loginAdmin, 
  getMe 
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add debug logging
router.use((req, res, next) => {
  console.log(`Auth route: ${req.method} ${req.path}`);
  next();
});

// User registration
router.post('/register', [
  body('first_name').notEmpty().withMessage('First name is required.'),
  body('last_name').notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], (req, res, next) => {
  console.log('Register endpoint hit');
  next();
}, registerUser);

// User login
router.post('/login', (req, res, next) => {
  console.log('User login endpoint hit');
  next();
}, loginUser);

// Admin login - ADD DEBUG LOGGING
router.post('/admin/login', (req, res, next) => {
  console.log('ADMIN LOGIN ENDPOINT HIT - Request body:', req.body);
  next();
}, loginAdmin);

// Get current user
router.get('/me', auth, (req, res, next) => {
  console.log('Get me endpoint hit');
  next();
}, getMe);

module.exports = router;