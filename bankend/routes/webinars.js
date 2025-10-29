const express = require('express');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/webinars/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'webinar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/webinars - Get all webinars (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, description, speaker, speaker_bio, date, duration, 
             max_attendees, current_attendees, join_link, recording_link,
             status, image_url, price, is_premium, category, tags,
             created_at, updated_at
      FROM webinars 
      WHERE status = 'scheduled' AND date > NOW()
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR speaker LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY date ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [webinars] = await db.execute(query, params);

    // Parse tags for each webinar
    const webinarsWithParsedTags = webinars.map(webinar => ({
      ...webinar,
      tags: webinar.tags ? JSON.parse(webinar.tags) : [],
      price: parseFloat(webinar.price) || 0,
      is_premium: Boolean(webinar.is_premium)
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM webinars WHERE status = "scheduled" AND date > NOW()';
    const countParams = [];

    if (category && category !== 'all') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR speaker LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const totalWebinars = countResult[0].total;

    res.json({
      success: true,
      data: {
        webinars: webinarsWithParsedTags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalWebinars,
          pages: Math.ceil(totalWebinars / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get webinars error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinars'
    });
  }
});

// GET /api/webinars/categories - Get webinar categories (PUBLIC)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT DISTINCT category 
      FROM webinars 
      WHERE status = 'scheduled' AND date > NOW()
      ORDER BY category
    `);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => cat.category).filter(cat => cat)
      }
    });
  } catch (error) {
    console.error('Get webinar categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinar categories'
    });
  }
});

// GET /api/webinars/:id - Get single webinar (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [webinars] = await db.execute(
      `SELECT id, title, description, speaker, speaker_bio, date, duration, 
              max_attendees, current_attendees, join_link, recording_link,
              status, image_url, price, is_premium, category, tags,
              created_at, updated_at
       FROM webinars WHERE id = ? AND status = 'scheduled' AND date > NOW()`,
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
      webinar.tags = JSON.parse(webinar.tags);
    }

    res.json({
      success: true,
      data: {
        webinar: {
          ...webinar,
          price: parseFloat(webinar.price) || 0,
          is_premium: Boolean(webinar.is_premium)
        }
      }
    });
  } catch (error) {
    console.error('Get webinar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinar'
    });
  }
});

// POST /api/webinars/:id/register - Register for webinar (PUBLIC)
router.post('/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Check if webinar exists and has available spots
    const [webinars] = await db.execute(
      'SELECT id, title, max_attendees, current_attendees FROM webinars WHERE id = ? AND status = "scheduled" AND date > NOW()',
      [id]
    );

    if (webinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webinar not found or registration closed'
      });
    }

    const webinar = webinars[0];

    if (webinar.current_attendees >= webinar.max_attendees) {
      return res.status(400).json({
        success: false,
        message: 'Webinar is fully booked'
      });
    }

    // Check if user already registered
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
      'INSERT INTO webinar_registrations (webinar_id, name, email, registration_date) VALUES (?, ?, ?, NOW())',
      [id, name, email]
    );

    // Update attendee count
    await db.execute(
      'UPDATE webinars SET current_attendees = current_attendees + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Successfully registered for the webinar!'
    });

  } catch (error) {
    console.error('Webinar registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for webinar'
    });
  }
});

// POST /api/webinars - Create webinar (ADMIN)
router.post('/', async (req, res) => {
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

// PUT /api/webinars/:id - Update webinar
router.put('/:id', async (req, res) => {
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

// DELETE /api/webinars/:id
router.delete('/:id', async (req, res) => {
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
router.post('/upload-image', upload.single('image'), async (req, res) => {
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

module.exports = router;