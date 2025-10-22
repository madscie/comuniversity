// controllers/bookController.js
const db = require('../config/database');

exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, minPrice, maxPrice } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, author, description, category, dewey_number, price, 
             format, cover_image, file_size, pages, publisher, published_date,
             language, rating, total_ratings, downloads, status, featured
      FROM books 
      WHERE status = 'available'
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ` AND price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ` AND price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    query += ` ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    console.log('Books query:', query);
    console.log('Query params:', params);

    const [books] = await db.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM books WHERE status = 'available'`;
    const countParams = [];

    if (category && category !== 'all') {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }

    if (search) {
      countQuery += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books: ' + error.message
    });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await db.execute(
      `SELECT * FROM books WHERE id = ? AND status = 'available'`,
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
};

exports.getFeaturedBooks = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const [books] = await db.execute(
      `SELECT id, title, author, description, category, price, cover_image, rating
       FROM books 
       WHERE featured = TRUE AND status = 'available'
       ORDER BY created_at DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: {
        books
      }
    });
  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured books'
    });
  }
};

exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const [books] = await db.execute(
      `SELECT id, title, author, description, category, price, cover_image, rating
       FROM books 
       WHERE category = ? AND status = 'available'
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [category, parseInt(limit), offset]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM books WHERE category = ? AND status = 'available'`,
      [category]
    );

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books by category'
    });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const [books] = await db.execute(
      `SELECT id, title, author, description, category, price, cover_image, rating
       FROM books 
       WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?) 
       AND status = 'available'
       ORDER BY 
         CASE 
           WHEN title LIKE ? THEN 1
           WHEN author LIKE ? THEN 2
           ELSE 3
         END,
         created_at DESC
       LIMIT ? OFFSET ?`,
      [
        `%${query}%`, `%${query}%`, `%${query}%`,
        `%${query}%`, `%${query}%`,
        parseInt(limit), offset
      ]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM books 
       WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?) 
       AND status = 'available'`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    res.json({
      success: true,
      data: {
        books,
        query,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching books'
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      `SELECT category, COUNT(*) as book_count 
       FROM books 
       WHERE status = 'available'
       GROUP BY category 
       ORDER BY book_count DESC`
    );

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
};

// Add these new functions to your existing bookController.js

exports.createBook = async (req, res) => {
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
      cover_image,
      file_url,
      file_size,
      pages,
      publisher,
      published_date,
      language,
      tags,
      total_copies,
      featured
    } = req.body;

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required fields'
      });
    }

    // Check if book with same ISBN already exists
    if (isbn) {
      const [existingBooks] = await db.execute(
        'SELECT id FROM books WHERE isbn = ?',
        [isbn]
      );
      if (existingBooks.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A book with this ISBN already exists'
        });
      }
    }

    // Insert new book
    const [result] = await db.execute(
      `INSERT INTO books (
        title, author, description, isbn, category, dewey_number, price, format,
        cover_image, file_url, file_size, pages, publisher, published_date,
        language, tags, total_copies, available_copies, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author,
        description || null,
        isbn || null,
        category,
        dewey_number || null,
        price ? parseFloat(price) : 0,
        format || 'PDF',
        cover_image || null,
        file_url || null,
        file_size || null,
        pages ? parseInt(pages) : null,
        publisher || null,
        published_date || null,
        language || 'English',
        tags ? JSON.stringify(tags) : null,
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

    console.log(`New book created: ${title} by ${author}`);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: {
        book: books[0]
      }
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book: ' + error.message
    });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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

    // Build update query dynamically
    const allowedFields = [
      'title', 'author', 'description', 'isbn', 'category', 'dewey_number',
      'price', 'format', 'cover_image', 'file_url', 'file_size', 'pages',
      'publisher', 'published_date', 'language', 'tags', 'total_copies',
      'available_copies', 'featured', 'status'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        
        // Handle special cases
        if (key === 'price') {
          values.push(parseFloat(updateData[key]));
        } else if (key === 'pages' || key === 'total_copies' || key === 'available_copies') {
          values.push(parseInt(updateData[key]));
        } else if (key === 'tags' && updateData[key]) {
          values.push(JSON.stringify(updateData[key]));
        } else if (key === 'featured') {
          values.push(Boolean(updateData[key]));
        } else {
          values.push(updateData[key]);
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

    console.log(`Book updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: {
        book: books[0]
      }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book: ' + error.message
    });
  }
};

exports.deleteBook = async (req, res) => {
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

    console.log(`Book deleted: ${bookTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book: ' + error.message
    });
  }
};

exports.uploadBookCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const coverUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      data: {
        coverUrl: coverUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading cover image: ' + error.message
    });
  }
};