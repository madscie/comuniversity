// routes/admin.js
const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for images
const uploadImage = multer({ 
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

// Configure multer for documents
const uploadDocument = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and text documents are allowed!'), false);
    }
  }
});

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get total books count
    const [booksCount] = await db.execute('SELECT COUNT(*) as total FROM books');
    
    // Get total users count
    const [usersCount] = await db.execute('SELECT COUNT(*) as total FROM users');
    
    // Get total articles count
    const [articlesCount] = await db.execute('SELECT COUNT(*) as total FROM articles');
    
    // Get active affiliates count
    const [affiliatesCount] = await db.execute('SELECT COUNT(*) as total FROM affiliates WHERE status = "approved"');
    
    // Get monthly revenue (placeholder)
    const monthlyRevenue = 0;
    
    // Get pending reviews (placeholder)
    const pendingReviews = 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks: booksCount[0].total,
          totalUsers: usersCount[0].total,
          totalArticles: articlesCount[0].total,
          activeAffiliates: affiliatesCount[0].total,
          monthlyRevenue: monthlyRevenue,
          pendingReviews: pendingReviews
        },
        recentActivity: [] // You can implement this later
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// GET /api/admin/books
router.get('/books', async (req, res) => {
  try {
    const [books] = await db.execute(`
      SELECT id, title, author, description, isbn, category, dewey_number, price, 
             format, cover_image, file_url, file_size, pages, publisher, 
             published_date, language, rating, total_ratings, downloads, 
             status, total_copies, available_copies, featured, created_at
      FROM books 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        books: books.map(book => ({
          ...book,
          publishedYear: book.published_date ? new Date(book.published_date).getFullYear() : null,
          status: book.status || 'available',
          availableCopies: book.available_copies || book.total_copies || 0,
          totalCopies: book.total_copies || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get admin books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books'
    });
  }
});

// ARTICLE ROUTES

// GET /api/admin/articles
router.get('/articles', async (req, res) => {
  try {
    const [articles] = await db.execute(`
      SELECT id, title, content, excerpt, author, category, image_url, 
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, price, is_premium, file_url, file_name, file_size, file_type,
             created_at, updated_at
      FROM articles 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        articles: articles.map(article => ({
          ...article,
          tags: article.tags ? JSON.parse(article.tags) : [],
          price: parseFloat(article.price) || 0,
          is_premium: Boolean(article.is_premium),
          file_size: article.file_size ? parseInt(article.file_size) : null
        }))
      }
    });
  } catch (error) {
    console.error('Get admin articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles'
    });
  }
});

// POST /api/admin/articles
router.post('/articles', async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      author,
      category,
      dewey_decimal,
      price,
      is_premium,
      read_time,
      status,
      tags,
      featured,
      image_url,
      file_url,
      file_name,
      file_size,
      file_type
    } = req.body;

    console.log('📥 Creating article with data:', req.body);

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required fields'
      });
    }

    // Build the insert query
    const columns = [
      'title', 'content', 'excerpt', 'author', 'category', 'dewey_decimal',
      'price', 'is_premium', 'image_url', 'file_url', 'file_name', 'file_size', 'file_type',
      'read_time', 'status', 'featured', 'published_date'
    ];
    const placeholders = columns.map(() => '?');
    const values = [
      title,
      content || '',
      excerpt || '',
      author,
      category,
      dewey_decimal || null,
      price ? parseFloat(price) : 0.00,
      is_premium ? Boolean(is_premium) : false,
      image_url || null,
      file_url || null,
      file_name || null,
      file_size ? parseInt(file_size) : null,
      file_type || null,
      parseInt(read_time) || 5,
      status || 'draft',
      featured ? Boolean(featured) : false,
      status === 'published' ? new Date().toISOString().split('T')[0] : null
    ];

    // Handle tags
    let tagsValue = null;
    if (tags) {
      if (Array.isArray(tags)) {
        tagsValue = JSON.stringify(tags);
      } else if (typeof tags === 'string') {
        // Convert comma-separated string to array
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        tagsValue = JSON.stringify(tagsArray);
      }
    }

    // Add tags to query if available
    if (tagsValue) {
      columns.push('tags');
      placeholders.push('?');
      values.push(tagsValue);
    }

    const query = `INSERT INTO articles (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    console.log('🔄 Insert query:', query);
    console.log('📊 Insert values:', values);

    const [result] = await db.execute(query, values);

    // Get the created article
    const [articles] = await db.execute(
      'SELECT * FROM articles WHERE id = ?',
      [result.insertId]
    );

    const createdArticle = articles[0];
    
    // Parse tags for response
    if (createdArticle.tags) {
      createdArticle.tags = JSON.parse(createdArticle.tags);
    }

    console.log(`✅ New article created: ${title} by ${author}`);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: {
        article: createdArticle
      }
    });
  } catch (error) {
    console.error('❌ Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating article: ' + error.message
    });
  }
});

// PUT /api/admin/articles/:id
router.put('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📥 Updating article ${id} with data:`, updateData);

    // Check if article exists
    const [existingArticles] = await db.execute(
      'SELECT id FROM articles WHERE id = ?',
      [id]
    );

    if (existingArticles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Build update query dynamically
    const allowedFields = [
      'title', 'content', 'excerpt', 'author', 'category', 'dewey_decimal',
      'price', 'is_premium', 'image_url', 'file_url', 'file_name', 'file_size', 'file_type',
      'read_time', 'status', 'featured', 'tags'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        
        // Handle special cases
        if (key === 'read_time' || key === 'file_size') {
          values.push(parseInt(updateData[key]) || null);
        } else if (key === 'price') {
          values.push(parseFloat(updateData[key]) || 0.00);
        } else if (key === 'featured' || key === 'is_premium') {
          values.push(Boolean(updateData[key]));
        } else if (key === 'tags' && updateData[key]) {
          // Handle tags formatting
          let tagsValue = null;
          if (Array.isArray(updateData[key])) {
            tagsValue = JSON.stringify(updateData[key]);
          } else if (typeof updateData[key] === 'string') {
            const tagsArray = updateData[key].split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            tagsValue = JSON.stringify(tagsArray);
          }
          values.push(tagsValue);
        } else if (key === 'status' && updateData[key] === 'published') {
          values.push('published');
          // Add published_date if not already in updates
          if (!updates.includes('published_date = ?')) {
            updates.push('published_date = ?');
            values.push(new Date().toISOString().split('T')[0]);
          }
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

    const query = `UPDATE articles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    console.log('🔄 Update query:', query);
    console.log('📊 Update values:', values);

    await db.execute(query, values);

    // Get updated article
    const [articles] = await db.execute(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    );

    const updatedArticle = articles[0];
    
    // Parse tags for response
    if (updatedArticle.tags) {
      updatedArticle.tags = JSON.parse(updatedArticle.tags);
    }

    console.log(`✅ Article updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: {
        article: updatedArticle
      }
    });
  } catch (error) {
    console.error('❌ Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating article: ' + error.message
    });
  }
});

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const [existingArticles] = await db.execute(
      'SELECT id, title FROM articles WHERE id = ?',
      [id]
    );

    if (existingArticles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const articleTitle = existingArticles[0].title;

    // Delete the article
    await db.execute(
      'DELETE FROM articles WHERE id = ?',
      [id]
    );

    console.log(`🗑️ Article deleted: ${articleTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting article: ' + error.message
    });
  }
});

// POST /api/admin/articles/upload-image
router.post('/articles/upload-image', uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    console.log(`🖼️ Article image uploaded: ${req.file.filename}`);

    res.json({
      success: true,
      message: 'Article image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename,
        fileSize: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('❌ Upload article image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading article image: ' + error.message
    });
  }
});

// POST /api/admin/articles/upload-file
router.post('/articles/upload-file', uploadDocument.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    console.log(`📄 Article document uploaded: ${req.file.originalname}`);

    res.json({
      success: true,
      message: 'Article document uploaded successfully',
      data: {
        fileUrl: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Upload article document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading article document: ' + error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please check the file size limits.'
      });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
});

module.exports = router;