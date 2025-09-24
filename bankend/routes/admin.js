// const express = require('express');
// const { body } = require('express-validator');
// const adminController = require('../controllers/adminController');
// const { authenticateToken, requireAdmin } = require('../middleware/auth');
// const { handleValidationErrors } = require('../middleware/validation');

// const router = express.Router();

// const adminLoginValidation = [
//   body('email')
//     .isEmail()
//     .withMessage('Please provide a valid email')
//     .normalizeEmail(),
  
//   body('password')
//     .notEmpty()
//     .withMessage('Password is required')
// ];

// // Admin routes
// router.post('/login', adminLoginValidation, handleValidationErrors, adminController.adminLogin);
// router.get('/users', authenticateToken, requireAdmin, adminController.getAllUsers);
// router.delete('/users/:userId', authenticateToken, requireAdmin, adminController.deleteUser);

// module.exports = router;

// routes/admin.js
const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
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

// Admin routes
router.post(
  '/login',
  adminLoginValidation,
  handleValidationErrors,
  adminController.login // matches the function name in adminController
);

router.get(
  '/users',
  authenticateToken,
  requireAdmin,
  adminController.getAllUsers // matches function name in adminController
);

router.delete(
  '/users/:userId',
  authenticateToken,
  requireAdmin,
  adminController.deleteUser // matches function name in adminController
);

module.exports = router;
