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

// GET /api/books - Get all books (PUBLIC - for users)
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📚 Fetching books with query params:', { category, search, page, limit });

    // Build base query without LIMIT/OFFSET first
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

    query += ' ORDER BY created_at DESC';

    console.log('🔍 Base query:', query);
    console.log('📊 Query parameters:', params);

    // First get all books (without pagination) to handle the data
    const [allBooks] = await db.execute(query, params);

    // Apply pagination manually in JavaScript
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBooks = allBooks.slice(startIndex, endIndex);

    console.log(`✅ Found ${allBooks.length} total books, showing ${paginatedBooks.length} (page ${page})`);

    res.json({
      success: true,
      data: {
        books: paginatedBooks.map(book => ({
          ...book,
          publishedYear: book.published_date ? new Date(book.published_date).getFullYear() : null,
          status: book.status || 'available',
          availableCopies: book.available_copies || book.total_copies || 0,
          totalCopies: book.total_copies || 0
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allBooks.length,
          pages: Math.ceil(allBooks.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get books error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching books: ' + error.message
    });
  }
});

// Alternative version with SQL pagination (if you want to try this instead)
router.get('/sql-paginated', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📚 Fetching books with SQL pagination:', { category, search, page, limit });

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
    
    // Convert to numbers and ensure they are integers
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    params.push(limitNum, offsetNum);

    console.log('🔍 Final query:', query);
    console.log('📊 Query parameters:', params);
    console.log('📊 Parameter types:', params.map(p => typeof p));

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
    const totalBooks = countResult[0].total;

    console.log(`✅ Found ${books.length} books out of ${totalBooks} total`);

    res.json({
      success: true,
      data: {
        books: books.map(book => ({
          ...book,
          publishedYear: book.published_date ? new Date(book.published_date).getFullYear() : null,
          status: book.status || 'available',
          availableCopies: book.available_copies || book.total_copies || 0,
          totalCopies: book.total_copies || 0
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalBooks,
          pages: Math.ceil(totalBooks / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get books error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching books: ' + error.message
    });
  }
});

// GET /api/books/categories - Get book categories (PUBLIC)
router.get('/categories', async (req, res) => {
  try {
    console.log('📚 Fetching book categories...');
    
    const [categories] = await db.execute(`
      SELECT category, COUNT(*) as book_count 
      FROM books 
      WHERE status = 'available'
      GROUP BY category 
      ORDER BY category
    `);

    console.log(`✅ Found ${categories.length} categories`);

    res.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories: ' + error.message
    });
  }
});

// GET /api/books/:id - Get single book (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📚 Fetching book with ID: ${id}`);

    const [books] = await db.execute(
      `SELECT id, title, author, description, isbn, category, dewey_number, price, 
              format, cover_image, file_url, file_size, pages, publisher, 
              published_date, language, rating, total_ratings, downloads, 
              status, total_copies, available_copies, featured, created_at
       FROM books WHERE id = ? AND status = "available"`,
      [parseInt(id)] // Ensure ID is a number
    );

    if (books.length === 0) {
      console.log(`❌ Book not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = books[0];

    console.log(`✅ Found book: ${book.title}`);

    res.json({
      success: true,
      message: 'Book fetched successfully',
      data: {
        book: {
          ...book,
          publishedYear: book.published_date ? new Date(book.published_date).getFullYear() : null,
          status: book.status || 'available',
          availableCopies: book.available_copies || book.total_copies || 0,
          totalCopies: book.total_copies || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book: ' + error.message
    });
  }
});

// POST /api/books - Create book (ADMIN only - but no auth for now)
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
        total_copies, available_copies, featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        total_copies ? parseInt(total_copies) : 1,
        featured ? Boolean(featured) : false,
        'available'
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
      [parseInt(id)]
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

    values.push(parseInt(id));

    const query = `UPDATE books SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    console.log('🔍 Update query:', query);
    console.log('📊 Update parameters:', values);
    
    await db.execute(query, values);

    // Get updated book
    const [books] = await db.execute(
      'SELECT * FROM books WHERE id = ?',
      [parseInt(id)]
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
      [parseInt(id)]
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
      [parseInt(id)]
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

// Helper function to categorize books
const categorizeBook = (book) => {
  if (!book.category || book.category.trim() === '') {
    return 'Uncategorized';
  }
  return book.category;
};

// Update the GET /api/books endpoint to handle uncategorized books
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📚 Fetching books with query params:', { category, search, page, limit });

    // Build base query without LIMIT/OFFSET first
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
      if (category === 'Uncategorized') {
        query += ' AND (category IS NULL OR category = "" OR category = "Uncategorized")';
      } else {
        query += ' AND category = ?';
        params.push(category);
      }
    }

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    console.log('🔍 Base query:', query);
    console.log('📊 Query parameters:', params);

    // First get all books (without pagination) to handle the data
    const [allBooks] = await db.execute(query, params);

    // Apply categorization to books
    const categorizedBooks = allBooks.map(book => ({
      ...book,
      category: categorizeBook(book)
    }));

    // Apply pagination manually in JavaScript
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBooks = categorizedBooks.slice(startIndex, endIndex);

    console.log(`✅ Found ${allBooks.length} total books, showing ${paginatedBooks.length} (page ${page})`);

    res.json({
      success: true,
      data: {
        books: paginatedBooks.map(book => ({
          ...book,
          publishedYear: book.published_date ? new Date(book.published_date).getFullYear() : null,
          status: book.status || 'available',
          availableCopies: book.available_copies || book.total_copies || 0,
          totalCopies: book.total_copies || 0
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allBooks.length,
          pages: Math.ceil(allBooks.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get books error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching books: ' + error.message
    });
  }
});

module.exports = router;