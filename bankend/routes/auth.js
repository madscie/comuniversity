// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getCurrentUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;