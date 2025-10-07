const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { auth } = require('../middleware/auth');
const upload = require('../config/upload');

// POST /api/books - Create new book (with file upload)
router.post(
  '/',
  auth,
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'content_file', maxCount: 1 }
  ]),
  bookController.createBook
);

// GET /api/books - Get all books
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - Get book by ID
router.get('/:id', bookController.getBookById);

// PUT /api/books/:id - Update book (ADD THIS ROUTE)
router.put(
  '/:id',
  auth,
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'content_file', maxCount: 1 }
  ]),
  bookController.updateBook
);

// DELETE /api/books/:id - Delete book
router.delete('/:id', auth, bookController.deleteBook);

// GET /api/books/search?q=query - Search books
router.get('/search', bookController.searchBooks);

// Debug route to check available routes
router.get('/debug/routes', (req, res) => {
  res.json({
    availableRoutes: [
      'POST /api/books',
      'GET /api/books', 
      'GET /api/books/:id',
      'PUT /api/books/:id',
      'DELETE /api/books/:id',
      'GET /api/books/search',
      'GET /api/books/debug/routes'
    ],
    message: 'If PUT route shows here, edit should work'
  });
});

module.exports = router;