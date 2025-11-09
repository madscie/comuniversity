const express = require('express');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/articles/images/');
    } else if (file.fieldname === 'document') {
      cb(null, 'uploads/articles/documents/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    if (file.fieldname === 'image') {
      cb(null, 'article-image-' + uniqueSuffix + ext);
    } else if (file.fieldname === 'document') {
      cb(null, 'article-doc-' + uniqueSuffix + ext);
    } else {
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      // Validate images
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid image file type. Only JPEG, PNG, GIF, WebP are allowed.'));
      }
    } else if (file.fieldname === 'document') {
      // Validate documents
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid document file type. Only PDF, DOC, DOCX, TXT, RTF are allowed.'));
      }
    } else {
      cb(null, true);
    }
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

// ARTICLES ROUTES WITH FILE UPLOADS

// GET /api/admin/articles - Get all articles for admin
router.get('/articles', async (req, res) => {
  try {
    console.log('📄 Admin: Fetching all articles...');
    
    const [articles] = await db.execute(`
      SELECT id, title, content, excerpt, author, category, image_url, 
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, amount, file_url, file_name, file_size, file_type,
             created_at, updated_at
      FROM articles 
      ORDER BY created_at DESC
    `);

    // Parse tags for each article
    const articlesWithParsedTags = articles.map(article => ({
      ...article,
      tags: article.tags ? (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags) : [],
      amount: parseFloat(article.amount) || 0,
      file_size: article.file_size ? parseInt(article.file_size) : null
    }));

    console.log(`✅ Admin: Found ${articles.length} articles`);

    res.json({
      success: true,
      data: {
        articles: articlesWithParsedTags
      }
    });

  } catch (error) {
    console.error('❌ Admin: Get articles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles: ' + error.message
    });
  }
});

// POST /api/admin/articles - Create article with file uploads
router.post('/articles', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📥 Admin: Creating article with data:', req.body);
    console.log('📁 Files:', req.files);

    const {
      title,
      content,
      excerpt,
      author,
      category,
      read_time,
      status,
      featured,
      tags,
      dewey_decimal,
      amount
    } = req.body;

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required fields'
      });
    }

    // Validate that either content or document is provided
    if (!content && !req.files?.document) {
      return res.status(400).json({
        success: false,
        message: 'Either content or a document file is required'
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

    // Handle file URLs
    let imageUrl = null;
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    if (req.files?.image) {
      imageUrl = `/uploads/articles/images/${req.files.image[0].filename}`;
    }

    if (req.files?.document) {
      const docFile = req.files.document[0];
      fileUrl = `/uploads/articles/documents/${docFile.filename}`;
      fileName = docFile.originalname;
      fileType = docFile.mimetype;
      fileSize = docFile.size;
    }

    // Insert article
    const [result] = await db.execute(
      `INSERT INTO articles (
        title, content, excerpt, author, category, image_url,
        read_time, status, featured, tags, dewey_decimal, amount,
        file_url, file_name, file_type, file_size, published_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content || '',
        excerpt || '',
        author,
        category,
        imageUrl,
        parseInt(read_time) || 5,
        status || 'draft',
        featured === 'true' ? 1 : 0,
        tagsValue,
        dewey_decimal || null,
        amount ? parseFloat(amount) : 0.00,
        fileUrl,
        fileName,
        fileType,
        fileSize,
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

    console.log(`✅ Admin: New article created: ${title} by ${author}`);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: {
        article: createdArticle
      }
    });

  } catch (error) {
    console.error('❌ Admin: Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating article: ' + error.message
    });
  }
});

// PUT /api/admin/articles/:id - Update article with file uploads
router.put('/articles/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 Admin: Updating article ${id} with data:`, req.body);
    console.log('📁 Files:', req.files);

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

    const {
      title,
      content,
      excerpt,
      author,
      category,
      read_time,
      status,
      featured,
      tags,
      dewey_decimal,
      amount
    } = req.body;

    // Validate that either content or document is provided
    if (!content && !req.files?.document) {
      const [currentArticle] = await db.execute(
        'SELECT file_url FROM articles WHERE id = ?',
        [id]
      );
      
      if (!currentArticle[0].file_url) {
        return res.status(400).json({
          success: false,
          message: 'Either content or a document file is required'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    // Add fields to update
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(excerpt);
    }
    if (author !== undefined) {
      updates.push('author = ?');
      values.push(author);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (read_time !== undefined) {
      updates.push('read_time = ?');
      values.push(parseInt(read_time));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      if (status === 'published') {
        updates.push('published_date = ?');
        values.push(new Date().toISOString().split('T')[0]);
      }
    }
    if (featured !== undefined) {
      updates.push('featured = ?');
      values.push(featured === 'true' ? 1 : 0);
    }
    if (tags !== undefined) {
      let tagsValue = null;
      if (tags) {
        if (Array.isArray(tags)) {
          tagsValue = JSON.stringify(tags);
        } else if (typeof tags === 'string') {
          const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
          tagsValue = JSON.stringify(tagsArray);
        }
      }
      updates.push('tags = ?');
      values.push(tagsValue);
    }
    if (dewey_decimal !== undefined) {
      updates.push('dewey_decimal = ?');
      values.push(dewey_decimal || null);
    }
    if (amount !== undefined) {
      updates.push('amount = ?');
      values.push(amount ? parseFloat(amount) : 0.00);
    }

    // Handle file updates
    if (req.files?.image) {
      updates.push('image_url = ?');
      values.push(`/uploads/articles/images/${req.files.image[0].filename}`);
    }

    if (req.files?.document) {
      const docFile = req.files.document[0];
      updates.push('file_url = ?');
      values.push(`/uploads/articles/documents/${docFile.filename}`);
      updates.push('file_name = ?');
      values.push(docFile.originalname);
      updates.push('file_type = ?');
      values.push(docFile.mimetype);
      updates.push('file_size = ?');
      values.push(docFile.size);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add updated_at and WHERE clause
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`;
    
    console.log('🔍 Update query:', query);
    console.log('📊 Update values:', values);

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

    console.log(`✅ Admin: Article updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: {
        article: updatedArticle
      }
    });

  } catch (error) {
    console.error('❌ Admin: Update article error:', error);
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

    console.log(`🗑️ Admin: Article deleted: ${articleTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('❌ Admin: Delete article error:', error);
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

    const imageUrl = `/uploads/articles/images/${req.file.filename}`;

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

// UPLOAD ARTICLE DOCUMENT
router.post('/articles/upload-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/articles/documents/${req.file.filename}`;

    console.log(`📄 Article document uploaded: ${req.file.filename}`);

    res.json({
      success: true,
      message: 'Article document uploaded successfully',
      data: {
        fileUrl: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
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

    // Safe parsing of tags
    const webinarsWithSafeTags = webinars.map(webinar => {
      let parsedTags = [];
      
      try {
        if (webinar.tags) {
          // Handle both stringified JSON and actual JSON
          if (typeof webinar.tags === 'string') {
            parsedTags = JSON.parse(webinar.tags);
          } else {
            parsedTags = webinar.tags;
          }
          
          // Ensure it's an array
          if (!Array.isArray(parsedTags)) {
            parsedTags = [];
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse tags for webinar ${webinar.id}:`, error.message);
        parsedTags = [];
      }

      return {
        ...webinar,
        tags: parsedTags,
        price: parseFloat(webinar.price) || 0,
        is_premium: Boolean(webinar.is_premium)
      };
    });

    res.json({
      success: true,
      data: {
        webinars: webinarsWithSafeTags
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
router.post('/webinars', upload.single('image'), async (req, res) => {
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
      status
    } = req.body;

    console.log('📥 Creating webinar with data:', req.body);
    console.log('📁 Files:', req.file);

    // Validate required fields
    if (!title || !description || !speaker || !date || !duration || !max_attendees) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, speaker, date, duration, and max_attendees are required fields'
      });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/webinars/${req.file.filename}`;
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
        tagsValue,
        status || 'scheduled',
        imageUrl
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

// PUT /api/admin/webinars/:id - Update webinar with file uploads
router.put('/webinars/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 Admin: Updating webinar ${id} with data:`, req.body);
    console.log('📁 Files:', req.file);

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
      status
    } = req.body;

    // Build update query
    const updates = [];
    const values = [];

    // Add fields to update
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (speaker !== undefined) {
      updates.push('speaker = ?');
      values.push(speaker);
    }
    if (speaker_bio !== undefined) {
      updates.push('speaker_bio = ?');
      values.push(speaker_bio);
    }
    if (date !== undefined) {
      updates.push('date = ?');
      values.push(new Date(date));
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      values.push(parseInt(duration));
    }
    if (max_attendees !== undefined) {
      updates.push('max_attendees = ?');
      values.push(parseInt(max_attendees));
    }
    if (join_link !== undefined) {
      updates.push('join_link = ?');
      values.push(join_link);
    }
    if (recording_link !== undefined) {
      updates.push('recording_link = ?');
      values.push(recording_link);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(parseFloat(price) || 0.00);
    }
    if (is_premium !== undefined) {
      updates.push('is_premium = ?');
      values.push(is_premium === 'true' ? 1 : 0);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (tags !== undefined) {
      let tagsValue = null;
      if (tags) {
        if (Array.isArray(tags)) {
          tagsValue = JSON.stringify(tags);
        } else if (typeof tags === 'string') {
          const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
          tagsValue = JSON.stringify(tagsArray);
        }
      }
      updates.push('tags = ?');
      values.push(tagsValue);
    }

    // Handle image update
    if (req.file) {
      updates.push('image_url = ?');
      values.push(`/uploads/webinars/${req.file.filename}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add updated_at and WHERE clause
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE webinars SET ${updates.join(', ')} WHERE id = ?`;
    
    console.log('🔍 Update query:', query);
    console.log('📊 Update values:', values);

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

    console.log(`✅ Admin: Webinar updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Webinar updated successfully',
      data: {
        webinar: updatedWebinar
      }
    });

  } catch (error) {
    console.error('❌ Admin: Update webinar error:', error);
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

    const imageUrl = `/uploads/webinars/${req.file.filename}`;

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

// GET /api/admin/webinars/:id/registrations
router.get('/webinars/:id/registrations', async (req, res) => {
  try {
    const { id } = req.params;

    const [registrations] = await db.execute(
      `SELECT wr.*, w.title as webinar_title 
       FROM webinar_registrations wr 
       JOIN webinars w ON wr.webinar_id = w.id 
       WHERE wr.webinar_id = ? 
       ORDER BY wr.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        registrations,
        total: registrations.length
      }
    });
  } catch (error) {
    console.error('Get webinar registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinar registrations'
    });
  }
});

// BOOKS ROUTES

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
router.post('/books', upload.single('coverImage'), async (req, res) => {
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
      featured,
      status
    } = req.body;

    console.log('📥 Creating book with data:', req.body);
    console.log('📁 Files:', req.file);

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required fields'
      });
    }

    // Handle cover image
    let coverImage = null;
    if (req.file) {
      coverImage = `/uploads/books/${req.file.filename}`;
    }

    // Insert new book
    const [result] = await db.execute(
      `INSERT INTO books (
        title, author, description, isbn, category, dewey_number, price,
        format, pages, publisher, published_date, language, 
        total_copies, available_copies, featured, status, cover_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        status || 'available',
        coverImage
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
router.put('/books/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📥 Updating book ${id} with data:`, updateData);
    console.log('📁 Files:', req.file);

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

    // Handle cover image update
    if (req.file) {
      updates.push('cover_image = ?');
      values.push(`/uploads/books/${req.file.filename}`);
    }

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

// UPLOAD BOOK COVER
router.post('/books/upload-cover', upload.single('coverImage'), async (req, res) => {
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


// USERS ROUTES

// GET /api/admin/users
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

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, affiliate_status } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updates = [];
    const values = [];

    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(Boolean(is_active));
    }

    if (affiliate_status !== undefined) {
      updates.push('affiliate_status = ?');
      values.push(affiliate_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);

    // Get updated user
    const [users] = await db.execute(
      'SELECT id, name, email, role, is_active, affiliate_status FROM users WHERE id = ?',
      [id]
    );

    console.log(`✅ User updated: ID ${id}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user: ' + error.message
    });
  }
});


module.exports = router;