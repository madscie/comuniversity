const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ 
    success: true,
    message: 'User profile route - to be implemented',
    user: req.user
  });
});

// GET /api/users/library
router.get('/library', authMiddleware, (req, res) => {
  res.json({ 
    success: true,
    message: 'User library route - to be implemented' 
  });
});

// GET /api/users/reading-list
router.get('/reading-list', authMiddleware, (req, res) => {
  res.json({ 
    success: true,
    message: 'Reading list route - to be implemented' 
  });
});

module.exports = router;