const db = require('../config/database');

exports.getAllWebinars = async (req, res) => {
  try {
    const { type = 'upcoming' } = req.query;

    let query = `
      SELECT id, title, description, speaker, date, duration, 
             max_attendees, current_attendees, join_link, recording_link,
             status, image_url, created_at
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
      status: 'success',
      data: { webinars }
    });
  } catch (error) {
    console.error('Get webinars error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};