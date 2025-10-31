const express = require('express');
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

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts from all tables
    const [booksCount] = await db.execute('SELECT COUNT(*) as total FROM books');
    const [usersCount] = await db.execute('SELECT COUNT(*) as total FROM users');
    const [articlesCount] = await db.execute('SELECT COUNT(*) as total FROM articles');
    const [webinarsCount] = await db.execute('SELECT COUNT(*) as total FROM webinars');
    const [affiliatesCount] = await db.execute('SELECT COUNT(*) as total FROM affiliates WHERE status = "approved"');

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks: booksCount[0].total,
          totalUsers: usersCount[0].total,
          totalArticles: articlesCount[0].total,
          totalWebinars: webinarsCount[0].total,
          activeAffiliates: affiliatesCount[0].total,
          monthlyRevenue: 0,
          pendingReviews: 0
        },
        recentActivity: []
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

// POST /api/admin/books
router.post('/books', async (req, res) => {
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

// PUT /api/admin/books/:id
router.put('/books/:id', async (req, res) => {
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

// DELETE /api/admin/books/:id
router.delete('/books/:id', async (req, res) => {
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

// ARTICLES ROUTES

// GET /api/admin/articles
router.get('/articles', async (req, res) => {
  try {
    const [articles] = await db.execute(`
      SELECT id, title, content, excerpt, author, category, image_url, 
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, amount, file_url, file_name, file_size, file_type,
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
          amount: parseFloat(article.amount) || 0,
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
      amount,
      read_time,
      status,
      tags,
      featured,
      image_url
    } = req.body;

    console.log('📥 Creating article with data:', req.body);

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required fields'
      });
    }

    // Handle tags
    let tagsValue = null;
    if (tags) {
      if (Array.isArray(tags)) {
        tagsValue = JSON.stringify(tags);
      } else if (typeof tags === 'string') {
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        tagsValue = JSON.stringify(tagsArray);
      }
    }

    // Insert article
    const [result] = await db.execute(
      `INSERT INTO articles (
        title, content, excerpt, author, category, dewey_decimal,
        amount, image_url, read_time, status, featured, tags, published_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content || '',
        excerpt || '',
        author,
        category,
        dewey_decimal || null,
        amount ? parseFloat(amount) : 0.00,
        image_url || null,
        parseInt(read_time) || 5,
        status || 'draft',
        featured ? Boolean(featured) : false,
        tagsValue,
        status === 'published' ? new Date().toISOString().split('T')[0] : null
      ]
    );

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

    // Build update query
    const allowedFields = [
      'title', 'content', 'excerpt', 'author', 'category', 'dewey_decimal',
      'amount', 'image_url', 'read_time', 'status', 'featured', 'tags'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        
        if (key === 'read_time') {
          values.push(parseInt(updateData[key]));
        } else if (key === 'amount') {
          values.push(parseFloat(updateData[key]) || 0.00);
        } else if (key === 'featured') {
          values.push(Boolean(updateData[key]));
        } else if (key === 'tags' && updateData[key]) {
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
    
    await db.execute(query, values);

    // Get updated article
    const [articles] = await db.execute(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    );

    const updatedArticle = articles[0];
    
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

// UPLOAD ARTICLE IMAGE
router.post('/articles/upload-image', upload.single('image'), async (req, res) => {
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
        filename: req.file.filename
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

// WEBINARS ROUTES

// GET /api/admin/webinars
router.get('/webinars', async (req, res) => {
  try {
    const [webinars] = await db.execute(`
      SELECT id, title, description, speaker, speaker_bio, date, duration, 
             max_attendees, current_attendees, join_link, recording_link,
             status, image_url, price, is_premium, category, tags,
             created_at, updated_at
      FROM webinars 
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        webinars: webinars.map(webinar => ({
          ...webinar,
          tags: webinar.tags ? JSON.parse(webinar.tags) : [],
          price: parseFloat(webinar.price) || 0,
          is_premium: Boolean(webinar.is_premium)
        }))
      }
    });
  } catch (error) {
    console.error('Get admin webinars error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinars'
    });
  }
});

// POST /api/admin/webinars
router.post('/webinars', async (req, res) => {
  try {
    const {
      title,
      description,
      speaker,
      speaker_bio,
      date,
      duration,
      max_attendees,
      join_link,
      recording_link,
      price,
      is_premium,
      category,
      tags,
      status,
      image_url
    } = req.body;

    console.log('📥 Creating webinar with data:', req.body);

    // Validate required fields
    if (!title || !description || !speaker || !date || !duration || !max_attendees) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, speaker, date, duration, and max_attendees are required fields'
      });
    }

    // Insert new webinar
    const [result] = await db.execute(
      `INSERT INTO webinars (
        title, description, speaker, speaker_bio, date, duration,
        max_attendees, join_link, recording_link, price, is_premium,
        category, tags, status, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        speaker,
        speaker_bio || null,
        new Date(date),
        parseInt(duration),
        parseInt(max_attendees),
        join_link || null,
        recording_link || null,
        price ? parseFloat(price) : 0.00,
        is_premium ? Boolean(is_premium) : false,
        category || 'Education',
        tags ? JSON.stringify(tags) : null,
        status || 'scheduled',
        image_url || null
      ]
    );

    // Get the created webinar
    const [webinars] = await db.execute(
      'SELECT * FROM webinars WHERE id = ?',
      [result.insertId]
    );

    const createdWebinar = webinars[0];
    
    // Parse tags for response
    if (createdWebinar.tags) {
      createdWebinar.tags = JSON.parse(createdWebinar.tags);
    }

    console.log(`✅ New webinar created: ${title} by ${speaker}`);

    res.status(201).json({
      success: true,
      message: 'Webinar created successfully',
      data: {
        webinar: createdWebinar
      }
    });
  } catch (error) {
    console.error('❌ Create webinar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating webinar: ' + error.message
    });
  }
});

// PUT /api/admin/webinars/:id
router.put('/webinars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📥 Updating webinar ${id} with data:`, updateData);

    // Check if webinar exists
    const [existingWebinars] = await db.execute(
      'SELECT id FROM webinars WHERE id = ?',
      [id]
    );

    if (existingWebinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webinar not found'
      });
    }

    // Build update query
    const allowedFields = [
      'title', 'description', 'speaker', 'speaker_bio', 'date', 'duration',
      'max_attendees', 'join_link', 'recording_link', 'price', 'is_premium',
      'category', 'tags', 'status', 'image_url'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        
        if (key === 'duration' || key === 'max_attendees') {
          values.push(parseInt(updateData[key]));
        } else if (key === 'price') {
          values.push(parseFloat(updateData[key]) || 0.00);
        } else if (key === 'is_premium') {
          values.push(Boolean(updateData[key]));
        } else if (key === 'date') {
          values.push(new Date(updateData[key]));
        } else if (key === 'tags' && updateData[key]) {
          values.push(JSON.stringify(updateData[key]));
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

    const query = `UPDATE webinars SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);

    // Get updated webinar
    const [webinars] = await db.execute(
      'SELECT * FROM webinars WHERE id = ?',
      [id]
    );

    const updatedWebinar = webinars[0];
    
    if (updatedWebinar.tags) {
      updatedWebinar.tags = JSON.parse(updatedWebinar.tags);
    }

    console.log(`✅ Webinar updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Webinar updated successfully',
      data: {
        webinar: updatedWebinar
      }
    });
  } catch (error) {
    console.error('❌ Update webinar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating webinar: ' + error.message
    });
  }
});

// DELETE /api/admin/webinars/:id
router.delete('/webinars/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if webinar exists
    const [existingWebinars] = await db.execute(
      'SELECT id, title FROM webinars WHERE id = ?',
      [id]
    );

    if (existingWebinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webinar not found'
      });
    }

    const webinarTitle = existingWebinars[0].title;

    // Delete webinar registrations first
    await db.execute(
      'DELETE FROM webinar_registrations WHERE webinar_id = ?',
      [id]
    );

    // Delete the webinar
    await db.execute(
      'DELETE FROM webinars WHERE id = ?',
      [id]
    );

    console.log(`🗑️ Webinar deleted: ${webinarTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Webinar deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete webinar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting webinar: ' + error.message
    });
  }
});

// UPLOAD WEBINAR IMAGE
router.post('/webinars/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    console.log(`🖼️ Webinar image uploaded: ${req.file.filename}`);

    res.json({
      success: true,
      message: 'Webinar image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Upload webinar image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading webinar image: ' + error.message
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        id, name, email, role, is_active, 
        affiliate_status, total_referrals, total_earnings,
        join_date, last_login, bio, profile_image,
        created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user,
          is_active: Boolean(user.is_active)
        }))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

module.exports = router;