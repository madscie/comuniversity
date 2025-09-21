const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  logout
} = require('../controllers/authController');
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;