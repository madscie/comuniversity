// routes/books.js
const express = require('express');
const {
  getBooks,
  getBookById,
  getFeaturedBooks,
  getBooksByCategory,
  searchBooks,
  getCategories,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover
} = require('../controllers/bookController');
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
    cb(null, 'book-cover-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
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
router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.get('/categories', getCategories);
router.get('/category/:category', getBooksByCategory);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Admin routes - protected
router.post('/', authMiddleware, adminMiddleware, createBook);
router.post('/upload-cover', authMiddleware, adminMiddleware, upload.single('cover'), uploadBookCover);
router.put('/:id', authMiddleware, adminMiddleware, updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBook);

module.exports = router;