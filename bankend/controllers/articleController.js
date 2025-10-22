// controllers/articleController.js
const db = require('../config/database');

exports.getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 9, search, category } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, excerpt, author, category, image_url, 
             views, read_time, published_date, created_at
      FROM articles 
      WHERE status = 'published'
    `;
    const params = [];

    if (search) {
      query += ` AND (title LIKE ? OR excerpt LIKE ? OR author LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY published_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [articles] = await db.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM articles WHERE status = 'published'`;
    const countParams = [];

    if (search) {
      countQuery += ` AND (title LIKE ? OR excerpt LIKE ? OR author LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles: ' + error.message
    });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await db.execute(
      `SELECT * FROM articles WHERE id = ? AND status = 'published'`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
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
          ...articles[0],
          tags: articles[0].tags ? JSON.parse(articles[0].tags) : []
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
};

exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      author,
      category,
      read_time,
      status,
      tags,
      featured,
      image_url
    } = req.body;

    // Validate required fields
    if (!title || !content || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, author, and category are required fields'
      });
    }

    // Insert new article
    const [result] = await db.execute(
      `INSERT INTO articles (
        title, content, excerpt, author, category, image_url,
        read_time, status, tags, featured, published_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        excerpt,
        author,
        category,
        image_url || null,
        parseInt(read_time) || 5,
        status || 'draft',
        tags ? JSON.stringify(tags) : null,
        featured ? Boolean(featured) : false,
        status === 'published' ? new Date().toISOString().split('T')[0] : null
      ]
    );

    // Get the created article
    const [articles] = await db.execute(
      'SELECT * FROM articles WHERE id = ?',
      [result.insertId]
    );

    console.log(`New article created: ${title} by ${author}`);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: {
        article: {
          ...articles[0],
          tags: articles[0].tags ? JSON.parse(articles[0].tags) : []
        }
      }
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating article: ' + error.message
    });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
      'title', 'content', 'excerpt', 'author', 'category', 'image_url',
      'read_time', 'status', 'tags', 'featured', 'published_date'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        
        // Handle special cases
        if (key === 'read_time') {
          values.push(parseInt(updateData[key]));
        } else if (key === 'tags' && updateData[key]) {
          values.push(JSON.stringify(updateData[key]));
        } else if (key === 'featured') {
          values.push(Boolean(updateData[key]));
        } else if (key === 'published_date' && updateData.status === 'published' && !updateData.published_date) {
          values.push(new Date().toISOString().split('T')[0]);
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

    const query = `UPDATE articles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);

    // Get updated article
    const [articles] = await db.execute(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    );

    console.log(`Article updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: {
        article: {
          ...articles[0],
          tags: articles[0].tags ? JSON.parse(articles[0].tags) : []
        }
      }
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating article: ' + error.message
    });
  }
};

exports.deleteArticle = async (req, res) => {
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

    console.log(`Article deleted: ${articleTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting article: ' + error.message
    });
  }
};

exports.uploadArticleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Article image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload article image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading article image: ' + error.message
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      `SELECT category, COUNT(*) as article_count 
       FROM articles 
       WHERE status = 'published'
       GROUP BY category 
       ORDER BY article_count DESC`
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

exports.getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 9 } = req.query;
    const offset = (page - 1) * limit;

    const [articles] = await db.execute(
      `SELECT id, title, excerpt, author, category, image_url, views, read_time, published_date
       FROM articles 
       WHERE category = ? AND status = 'published'
       ORDER BY published_date DESC 
       LIMIT ? OFFSET ?`,
      [category, parseInt(limit), offset]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM articles WHERE category = ? AND status = 'published'`,
      [category]
    );

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get articles by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles by category'
    });
  }
};

exports.searchArticles = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 9 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const [articles] = await db.execute(
      `SELECT id, title, excerpt, author, category, image_url, views, read_time, published_date
       FROM articles 
       WHERE (title LIKE ? OR excerpt LIKE ? OR author LIKE ? OR content LIKE ?) 
       AND status = 'published'
       ORDER BY 
         CASE 
           WHEN title LIKE ? THEN 1
           WHEN excerpt LIKE ? THEN 2
           WHEN author LIKE ? THEN 3
           ELSE 4
         END,
         published_date DESC
       LIMIT ? OFFSET ?`,
      [
        `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`,
        `%${query}%`, `%${query}%`, `%${query}%`,
        parseInt(limit), offset
      ]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM articles 
       WHERE (title LIKE ? OR excerpt LIKE ? OR author LIKE ? OR content LIKE ?) 
       AND status = 'published'`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    res.json({
      success: true,
      data: {
        articles,
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
    console.error('Search articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching articles'
    });
  }
};