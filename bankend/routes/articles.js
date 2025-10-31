const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET /api/articles - Get all published articles
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📄 Fetching articles with params:', { category, search, page, limit });

    // Build base query without LIMIT/OFFSET for prepared statement
    let query = `
      SELECT id, title, content, excerpt, author, category, image_url, 
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, amount, file_url, file_name, file_size, file_type,
             created_at, updated_at
      FROM articles 
      WHERE status = 'published'
    `;
    
    let params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    console.log('🔍 Base query:', query);
    console.log('📊 Base params:', params);

    // Execute query without LIMIT/OFFSET first
    const [allArticles] = await db.execute(query, params);

    // Apply pagination manually in JavaScript
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedArticles = allArticles.slice(startIndex, endIndex);

    console.log(`✅ Found ${allArticles.length} total articles, showing ${paginatedArticles.length} after pagination`);

    // Parse tags safely
    const articlesWithParsedTags = paginatedArticles.map(article => ({
      ...article,
      tags: article.tags ? (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags) : [],
      amount: parseFloat(article.amount) || 0,
      file_size: article.file_size ? parseInt(article.file_size) : null
    }));

    res.json({
      success: true,
      data: {
        articles: articlesWithParsedTags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allArticles.length,
          pages: Math.ceil(allArticles.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get articles error:', error.message);
    console.error('❌ Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles: ' + error.message
    });
  }
});

// GET /api/articles/categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT DISTINCT category 
      FROM articles 
      WHERE status = 'published' AND category IS NOT NULL
      ORDER BY category
    `);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => cat.category)
      }
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
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

    const article = articles[0];
    
    // Update view count
    await db.execute(
      'UPDATE articles SET views = views + 1 WHERE id = ?',
      [id]
    );

    // Parse tags
    if (article.tags) {
      article.tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags;
    }

    res.json({
      success: true,
      data: { article }
    });

  } catch (error) {
    console.error('❌ Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching article'
    });
  }
});

// GET /api/articles/featured/all
router.get('/featured/all', async (req, res) => {
  try {
    const [articles] = await db.execute(`
      SELECT id, title, excerpt, author, category, image_url, 
             views, read_time, published_date, tags
      FROM articles 
      WHERE status = 'published' AND featured = 1
      ORDER BY created_at DESC 
      LIMIT 6
    `);

    const articlesWithParsedTags = articles.map(article => ({
      ...article,
      tags: article.tags ? (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags) : []
    }));

    res.json({
      success: true,
      data: {
        articles: articlesWithParsedTags
      }
    });

  } catch (error) {
    console.error('❌ Get featured articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured articles'
    });
  }
});

// SIMPLE TEST ENDPOINT - NO PAGINATION
router.get('/test/simple', async (req, res) => {
  try {
    const [articles] = await db.execute(`
      SELECT id, title, author, category 
      FROM articles 
      WHERE status = 'published' 
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        articles: articles,
        message: `Found ${articles.length} articles`
      }
    });
  } catch (error) {
    console.error('❌ Simple test error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed: ' + error.message
    });
  }
});

module.exports = router;