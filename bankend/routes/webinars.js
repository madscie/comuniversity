const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET /api/webinars - Get all webinars
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    console.log('🎓 Fetching webinars with params:', { category, search, page, limit });

    // Build base query without LIMIT/OFFSET for prepared statement
    let query = `
      SELECT id, title, description, speaker, speaker_bio, date, duration, 
             max_attendees, current_attendees, join_link, recording_link,
             status, image_url, price, is_premium, category, tags,
             created_at, updated_at
      FROM webinars 
      WHERE status = 'scheduled'
    `;
    
    let params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR speaker LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY date ASC';

    console.log('🔍 Base query:', query);
    console.log('📊 Base params:', params);

    // Execute query without LIMIT/OFFSET first
    const [allWebinars] = await db.execute(query, params);

    // Apply pagination manually in JavaScript
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWebinars = allWebinars.slice(startIndex, endIndex);

    console.log(`✅ Found ${allWebinars.length} total webinars, showing ${paginatedWebinars.length} after pagination`);

    // Parse tags safely
    const webinarsWithParsedTags = paginatedWebinars.map(webinar => ({
      ...webinar,
      tags: webinar.tags ? (typeof webinar.tags === 'string' ? JSON.parse(webinar.tags) : webinar.tags) : [],
      price: parseFloat(webinar.price) || 0,
      is_premium: Boolean(webinar.is_premium)
    }));

    res.json({
      success: true,
      data: {
        webinars: webinarsWithParsedTags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allWebinars.length,
          pages: Math.ceil(allWebinars.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get webinars error:', error.message);
    console.error('❌ Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinars: ' + error.message
    });
  }
});

// GET /api/webinars/categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT DISTINCT category 
      FROM webinars 
      WHERE status = 'scheduled' AND category IS NOT NULL
      ORDER BY category
    `);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => cat.category)
      }
    });
  } catch (error) {
    console.error('❌ Get webinar categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinar categories'
    });
  }
});

// GET /api/webinars/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [webinars] = await db.execute(
      `SELECT * FROM webinars WHERE id = ? AND status = 'scheduled'`,
      [id]
    );

    if (webinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webinar not found'
      });
    }

    const webinar = webinars[0];
    
    // Parse tags
    if (webinar.tags) {
      webinar.tags = typeof webinar.tags === 'string' ? JSON.parse(webinar.tags) : webinar.tags;
    }

    res.json({
      success: true,
      data: { webinar }
    });

  } catch (error) {
    console.error('❌ Get webinar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinar'
    });
  }
});

// GET /api/webinars/featured/all
router.get('/featured/all', async (req, res) => {
  try {
    const [webinars] = await db.execute(`
      SELECT id, title, description, speaker, date, duration, 
             image_url, price, is_premium, category, tags
      FROM webinars 
      WHERE status = 'scheduled'
      ORDER BY date ASC 
      LIMIT 6
    `);

    const webinarsWithParsedTags = webinars.map(webinar => ({
      ...webinar,
      tags: webinar.tags ? (typeof webinar.tags === 'string' ? JSON.parse(webinar.tags) : webinar.tags) : [],
      price: parseFloat(webinar.price) || 0,
      is_premium: Boolean(webinar.is_premium)
    }));

    res.json({
      success: true,
      data: {
        webinars: webinarsWithParsedTags
      }
    });

  } catch (error) {
    console.error('❌ Get featured webinars error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured webinars'
    });
  }
});

// SIMPLE TEST ENDPOINT - NO PAGINATION
router.get('/test/simple', async (req, res) => {
  try {
    const [webinars] = await db.execute(`
      SELECT id, title, speaker, date 
      FROM webinars 
      WHERE status = 'scheduled' 
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        webinars: webinars,
        message: `Found ${webinars.length} webinars`
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

// POST /api/webinars/:id/register
router.post('/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company } = req.body;

    console.log(`🎓 Registering for webinar ${id}:`, { name, email, company });

    // Check if webinar exists
    const [webinars] = await db.execute(
      'SELECT id, title, max_attendees, current_attendees FROM webinars WHERE id = ? AND status = "scheduled"',
      [id]
    );

    if (webinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webinar not found'
      });
    }

    const webinar = webinars[0];

    if (webinar.current_attendees >= webinar.max_attendees) {
      return res.status(400).json({
        success: false,
        message: 'Webinar is fully booked'
      });
    }

    // Check if already registered
    const [existingRegistrations] = await db.execute(
      'SELECT id FROM webinar_registrations WHERE webinar_id = ? AND email = ?',
      [id, email]
    );

    if (existingRegistrations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this webinar'
      });
    }

    // Register user
    await db.execute(
      'INSERT INTO webinar_registrations (webinar_id, name, email, company, registration_date) VALUES (?, ?, ?, ?, NOW())',
      [id, name, email, company || null]
    );

    // Update attendee count
    await db.execute(
      'UPDATE webinars SET current_attendees = current_attendees + 1 WHERE id = ?',
      [id]
    );

    console.log(`✅ Successfully registered ${email} for webinar ${id}`);

    res.json({
      success: true,
      message: 'Successfully registered for the webinar!'
    });

  } catch (error) {
    console.error('❌ Webinar registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for webinar: ' + error.message
    });
  }
});

module.exports = router;