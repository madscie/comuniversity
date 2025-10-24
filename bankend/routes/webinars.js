// routes/webinars.js
const express = require('express');
const {
  getAllWebinars,
  getWebinarById,
  registerForWebinar,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  uploadWebinarImage
} = require('../controllers/webinarController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for webinar image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/webinars/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'webinar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.get('/', getAllWebinars);
router.get('/:id', getWebinarById);
router.post('/:id/register', registerForWebinar);

// Admin routes - protected
router.post('/', authMiddleware, adminMiddleware, createWebinar);
router.post('/upload-image', authMiddleware, adminMiddleware, upload.single('image'), uploadWebinarImage);
router.put('/:id', authMiddleware, adminMiddleware, updateWebinar);
router.delete('/:id', authMiddleware, adminMiddleware, deleteWebinar);

module.exports = router;