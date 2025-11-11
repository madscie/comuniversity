const db = require('../config/database');

// Get all webinars (public)
exports.getAllWebinars = async (req, res) => {
  try {
    const { type = 'upcoming' } = req.query;

    let query = `
      SELECT id, title, description, speaker, speaker_bio, date, duration, 
             max_attendees, current_attendees, join_link, recording_link,
             status, image_url, price, is_premium, category, tags, created_at
      FROM webinars
      WHERE status != 'cancelled'
    `;

    if (type === 'upcoming') {
      query += ` AND date > NOW() AND status = 'scheduled'`;
    } else if (type === 'past') {
      query += ` AND (date <= NOW() OR status = 'completed')`;
    }

    query += ` ORDER BY date ${type === 'upcoming' ? 'ASC' : 'DESC'}`;

    const [webinars] = await db.execute(query);

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
    console.error('Get webinars error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinars'
    });
  }
};

// Get webinar by ID (public)
exports.getWebinarById = async (req, res) => {
  try {
    const { id } = req.params;

    const [webinars] = await db.execute(
      `SELECT * FROM webinars WHERE id = ? AND status != 'cancelled'`,
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
      data: { webinar }
    });
  } catch (error) {
    console.error('Get webinar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webinar'
    });
  }
};

// Register for webinar (public)
exports.registerForWebinar = async (req, res) => {
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
};

// Create webinar (admin)
exports.createWebinar = async (req, res) => {
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
};

// Update webinar (admin)
exports.updateWebinar = async (req, res) => {
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

    // Build update query dynamically
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
        
        // Handle special cases
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
    
    console.log('🔄 Update query:', query);
    console.log('📊 Update values:', values);

    await db.execute(query, values);

    // Get updated webinar
    const [webinars] = await db.execute(
      'SELECT * FROM webinars WHERE id = ?',
      [id]
    );

    const updatedWebinar = webinars[0];
    
    // Parse tags for response
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
};

// Delete webinar (admin)
exports.deleteWebinar = async (req, res) => {
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
};

// Upload webinar image (admin)
exports.uploadWebinarImage = async (req, res) => {
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
};

// Get webinar registrations (admin)
exports.getWebinarRegistrations = async (req, res) => {
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
};