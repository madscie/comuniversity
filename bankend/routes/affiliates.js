const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// All affiliate routes require authentication
router.use(authMiddleware);

// GET /api/affiliates
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Affiliates route - to be implemented' 
  });
});

// GET /api/affiliates/status
router.get('/status', (req, res) => {
  res.json({ 
    success: true,
    message: 'Affiliate status route - to be implemented',
    user: req.user
  });
});

module.exports = router;