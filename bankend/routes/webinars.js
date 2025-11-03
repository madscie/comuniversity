const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET /api/webinars - Get all webinars (SIMPLE VERSION)
router.get('/', async (req, res) => {
  try {
    console.log('🎓 Fetching scheduled webinars...');
    
    // SIMPLE QUERY - NO COMPLEX PARAMS
    const query = `
      SELECT id, title, description, speaker, speaker_bio, date, duration, 
             max_attendees, current_attendees, join_link, recording_link,
             status, image_url, price, is_premium, category, tags,
             created_at, updated_at
      FROM webinars 
      WHERE status = 'scheduled'
      ORDER BY date ASC
      LIMIT 50
    `;

    console.log('🔍 Query:', query);
    
    const [webinars] = await db.execute(query);
    
    console.log(`✅ Found ${webinars.length} scheduled webinars`);

    // Parse tags safely
    const webinarsWithParsedTags = webinars.map(webinar => ({
      ...webinar,
      tags: webinar.tags ? (typeof webinar.tags === 'string' ? JSON.parse(webinar.tags) : webinar.tags) : [],
      price: parseFloat(webinar.price) || 0,
      is_premium: Boolean(webinar.is_premium)
    }));

    res.json({
      success: true,
      data: {
        webinars: webinarsWithParsedTags,
        total: webinars.length
      }
    });

  } catch (error) {
    console.error('❌ Get webinars error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinars: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

// POST /api/webinars/:id/register
router.post('/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company } = req.body;

    // Check if webinar exists and has available spots
    const [webinars] = await db.execute(
      'SELECT id, title, max_attendees, current_attendees FROM webinars WHERE id = ? AND status = "scheduled"',
      [id]
    );

    if (webinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webinar not found or not available for registration'
      });
    }

    const webinar = webinars[0];

    if (webinar.current_attendees >= webinar.max_attendees) {
      return res.status(400).json({
        success: false,
        message: 'Webinar is full'
      });
    }

    // Check if user is already registered
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
      'INSERT INTO webinar_registrations (webinar_id, name, email, company) VALUES (?, ?, ?, ?)',
      [id, name, email, company || null]
    );

    // Update attendee count
    await db.execute(
      'UPDATE webinars SET current_attendees = current_attendees + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Successfully registered for webinar'
    });
  } catch (error) {
    console.error('Register for webinar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for webinar'
    });
  }
});

// HEALTH CHECK ENDPOINT
router.get('/health/check', async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as count FROM webinars WHERE status = "scheduled"');
    res.json({
      success: true,
      message: `Webinars API is working! Found ${result[0].count} scheduled webinars.`,
      count: result[0].count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Webinars API health check failed: ' + error.message
    });
  }
});

module.exports = router;