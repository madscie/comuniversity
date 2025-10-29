const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// All download routes require authentication
router.use(authMiddleware);

// GET /api/downloads
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Downloads route - to be implemented' 
  });
});

module.exports = router;