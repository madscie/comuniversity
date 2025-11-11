const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// All payment routes require authentication
router.use(authMiddleware);

// GET /api/payments
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Payments route - to be implemented' 
  });
});

module.exports = router;