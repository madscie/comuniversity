// routes/books.js
const express = require('express');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/books/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// NO AUTHENTICATION - ALL BOOK ROUTES ARE PUBLIC

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, author, description, isbn, category, dewey_number, price, 
             format, cover_image, file_url, file_size, pages, publisher, 
             published_date, language, rating, total_ratings, downloads, 
             status, total_copies, available_copies, featured, created_at
      FROM books 
      WHERE status = 'available'
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [books] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM books WHERE status = "available"';
    const countParams = [];

    if (category && category !== 'all') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      data: {
        books: books.map(book => ({
          ...book,
          publishedYear: book.published_date ? new Date(book.published_date).getFullYear() : null
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books'
    });
  }
});

// GET /api/books/categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT category, COUNT(*) as book_count 
      FROM books 
      WHERE status = 'available'
      GROUP BY category 
      ORDER BY book_count DESC
    `);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await db.execute(
      'SELECT * FROM books WHERE id = ? AND status = "available"',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: {
        book: books[0]
      }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book'
    });
  }
});

// POST /api/books - Create book (for admin, but no auth for now)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      isbn,
      category,
      dewey_number,
      price,
      format,
      pages,
      publisher,
      published_date,
      language,
      total_copies,
      featured
    } = req.body;

    console.log('📥 Creating book with data:', req.body);

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required fields'
      });
    }

    // Insert new book
    const [result] = await db.execute(
      `INSERT INTO books (
        title, author, description, isbn, category, dewey_number, price,
        format, pages, publisher, published_date, language, 
        total_copies, available_copies, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author,
        description || '',
        isbn || null,
        category,
        dewey_number || null,
        price ? parseFloat(price) : 0.00,
        format || 'physical',
        pages ? parseInt(pages) : null,
        publisher || null,
        published_date || null,
        language || 'English',
        total_copies ? parseInt(total_copies) : 1,
        total_copies ? parseInt(total_copies) : 1, // available_copies same as total_copies initially
        featured ? Boolean(featured) : false
      ]
    );

    // Get the created book
    const [books] = await db.execute(
      'SELECT * FROM books WHERE id = ?',
      [result.insertId]
    );

    console.log(`✅ New book created: ${title} by ${author}`);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: {
        book: books[0]
      }
    });
  } catch (error) {
    console.error('❌ Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book: ' + error.message
    });
  }
});

// PUT /api/books/:id - Update book
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📥 Updating book ${id} with data:`, updateData);

    // Check if book exists
    const [existingBooks] = await db.execute(
      'SELECT id FROM books WHERE id = ?',
      [id]
    );

    if (existingBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Build update query
    const allowedFields = [
      'title', 'author', 'description', 'isbn', 'category', 'dewey_number',
      'price', 'format', 'pages', 'publisher', 'published_date', 'language',
      'total_copies', 'available_copies', 'featured', 'status'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        
        if (key === 'price') {
          values.push(parseFloat(updateData[key]) || 0.00);
        } else if (key === 'pages' || key === 'total_copies' || key === 'available_copies') {
          values.push(parseInt(updateData[key]) || null);
        } else if (key === 'featured') {
          values.push(Boolean(updateData[key]));
        } else {
          values.push(updateData[key] || null);
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    const query = `UPDATE books SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);

    // Get updated book
    const [books] = await db.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    console.log(`✅ Book updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: {
        book: books[0]
      }
    });
  } catch (error) {
    console.error('❌ Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book: ' + error.message
    });
  }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const [existingBooks] = await db.execute(
      'SELECT id, title FROM books WHERE id = ?',
      [id]
    );

    if (existingBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const bookTitle = existingBooks[0].title;

    // Delete the book
    await db.execute(
      'DELETE FROM books WHERE id = ?',
      [id]
    );

    console.log(`🗑️ Book deleted: ${bookTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book: ' + error.message
    });
  }
});

// UPLOAD BOOK COVER
router.post('/upload-cover', upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/books/${req.file.filename}`;

    console.log(`🖼️ Book cover uploaded: ${req.file.filename}`);

    res.json({
      success: true,
      message: 'Book cover uploaded successfully',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Upload book cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading book cover: ' + error.message
    });
  }
});

module.exports = router;