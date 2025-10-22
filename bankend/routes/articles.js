// routes/articles.js
const express = require('express');
const {
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  searchArticles,
  getCategories,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadArticleImage
} = require('../controllers/articleController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-image-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
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
router.get('/', getAllArticles);
router.get('/categories', getCategories);
router.get('/category/:category', getArticlesByCategory);
router.get('/search', searchArticles);
router.get('/:id', getArticleById);

// Admin routes - protected
router.post('/', authMiddleware, adminMiddleware, createArticle);
router.post('/upload-image', authMiddleware, adminMiddleware, upload.single('image'), uploadArticleImage);
router.put('/:id', authMiddleware, adminMiddleware, updateArticle);
router.delete('/:id', authMiddleware, adminMiddleware, deleteArticle);

module.exports = router;