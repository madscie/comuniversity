const express = require('express');
const router = express.Router();

// GET /api/webinars
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Webinars route - to be implemented' 
  });
});

module.exports = router;