const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { auth } = require('../middleware/auth');
const upload = require('../config/upload'); // Import from config file

// POST /api/books - Create new book (with file upload)
router.post(
  '/',
  auth,
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'file_url', maxCount: 1 }
  ]),
  bookController.createBook
);

// GET /api/books - Get all books
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - Get book by ID
router.get('/:id', bookController.getBookById);

// PUT /api/books/:id - Update book
router.put('/:id', auth, bookController.updateBook);

// DELETE /api/books/:id - Delete book
router.delete('/:id', auth, bookController.deleteBook);

// GET /api/books/search?q=query - Search books
router.get('/search', bookController.searchBooks);

module.exports = router;