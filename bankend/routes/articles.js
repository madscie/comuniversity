const express = require('express');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/articles/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/articles - Get all published articles (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, content, excerpt, author, category, image_url, 
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, amount, file_url, file_name, file_size, file_type,
             created_at, updated_at
      FROM articles 
      WHERE status = 'published'
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [articles] = await db.execute(query, params);

    // Parse tags for each article
    const articlesWithParsedTags = articles.map(article => ({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      amount: parseFloat(article.amount) || 0,
      file_size: article.file_size ? parseInt(article.file_size) : null
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE status = "published"';
    const countParams = [];

    if (category && category !== 'all') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const totalArticles = countResult[0].total;

    res.json({
      success: true,
      data: {
        articles: articlesWithParsedTags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalArticles,
          pages: Math.ceil(totalArticles / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles'
    });
  }
});

// GET /api/articles/categories - Get article categories (PUBLIC)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT DISTINCT category 
      FROM articles 
      WHERE status = 'published' 
      ORDER BY category
    `);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => cat.category).filter(cat => cat)
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// GET /api/articles/:id - Get single article (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await db.execute(
      `SELECT id, title, content, excerpt, author, category, image_url, 
              views, read_time, published_date, status, featured, tags,
              dewey_decimal, amount, file_url, file_name, file_size, file_type,
              created_at, updated_at
       FROM articles WHERE id = ? AND status = 'published'`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const article = articles[0];
    
    // Parse tags
    if (article.tags) {
      article.tags = JSON.parse(article.tags);
    }

    // Increment view count
    await db.execute(
      'UPDATE articles SET views = views + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        article: {
          ...article,
          amount: parseFloat(article.amount) || 0,
          file_size: article.file_size ? parseInt(article.file_size) : null
        }
      }
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching article'
    });
  }
});

// POST /api/articles - Create article (ADMIN)
router.post('/', async (req, res) => {
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

// PUT /api/articles/:id - Update article
router.put('/:id', async (req, res) => {
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

// DELETE /api/articles/:id
router.delete('/:id', async (req, res) => {
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
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/articles/${req.file.filename}`;

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

module.exports = router;