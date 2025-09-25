// 

const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth'); // Remove requireAdmin
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules for admin login
const adminLoginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Admin routes - FIXED: Remove requireAdmin middleware for now
router.post(
  '/login',
  adminLoginValidation,
  handleValidationErrors,
  adminController.login
);

// Comment out problematic routes temporarily
// router.get(
//   '/users',
//   authenticateToken,
//   adminController.getAllUsers
// );

// router.delete(
//   '/users/:userId',
//   authenticateToken,
//   adminController.deleteUser
// );

// Add a simple test route
// router.get('/test', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'Admin routes are working!',
//     timestamp: new Date().toISOString()
//   });
// });

module.exports = router;