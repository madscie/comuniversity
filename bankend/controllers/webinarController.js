import db from "../config/database.js";

// Helper function for parsing webinar tags safely
const parseWebinarTags = (webinar) => {
  let parsedTags = [];

  try {
    if (webinar.tags) {
      if (typeof webinar.tags === "string") {
        parsedTags = JSON.parse(webinar.tags);
      } else {
        parsedTags = webinar.tags;
      }

      if (!Array.isArray(parsedTags)) {
        parsedTags = [];
      }
    }
  } catch (error) {
    console.warn(
      `⚠️ Failed to parse tags for webinar ${webinar.id}:`,
      error.message
    );
    parsedTags = [];
  }

  return {
    ...webinar,
    tags: parsedTags,
    price: parseFloat(webinar.price) || 0,
    is_premium: Boolean(webinar.is_premium),
  };
};

// Get all scheduled webinars
export const getWebinars = async (req, res) => {
  try {
    console.log("🎓 Fetching scheduled webinars...");

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
    console.log("🔍 Query:", query);

    const [webinars] = await db.execute(query);
    console.log(`✅ Found ${webinars.length} scheduled webinars`);

    const webinarsWithParsedTags = webinars.map(parseWebinarTags);

    res.json({
      success: true,
      data: {
        webinars: webinarsWithParsedTags,
        total: webinars.length,
      },
    });
  } catch (error) {
    console.error("❌ Get webinars error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching webinars: " + error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get single webinar by ID
export const getWebinarById = async (req, res) => {
  try {
    const { id } = req.params;
    const [webinars] = await db.execute(
      "SELECT * FROM webinars WHERE id = ? AND status = 'scheduled'",
      [id]
    );

    if (webinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    const webinar = parseWebinarTags(webinars[0]);

    res.json({
      success: true,
      data: { webinar },
    });
  } catch (error) {
    console.error("❌ Get webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinar",
    });
  }
};

// Get webinar categories
export const getWebinarCategories = async (req, res) => {
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
        categories: categories.map((cat) => cat.category),
      },
    });
  } catch (error) {
    console.error("❌ Get webinar categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinar categories",
    });
  }
};

// Register for webinar
export const registerForWebinar = async (req, res) => {
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
        message: "Webinar not found or not available for registration",
      });
    }

    const webinar = webinars[0];

    if (webinar.current_attendees >= webinar.max_attendees) {
      return res.status(400).json({
        success: false,
        message: "Webinar is full",
      });
    }

    // Check if user is already registered
    const [existingRegistrations] = await db.execute(
      "SELECT id FROM webinar_registrations WHERE webinar_id = ? AND email = ?",
      [id, email]
    );

    if (existingRegistrations.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this webinar",
      });
    }

    // Register user
    await db.execute(
      "INSERT INTO webinar_registrations (webinar_id, name, email, company) VALUES (?, ?, ?, ?)",
      [id, name, email, company || null]
    );

    // Update attendee count
    await db.execute(
      "UPDATE webinars SET current_attendees = current_attendees + 1 WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Successfully registered for webinar",
    });
  } catch (error) {
    console.error("❌ Register for webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering for webinar",
    });
  }
};

// Health check endpoint
export const getWebinarHealth = async (req, res) => {
  try {
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM webinars WHERE status = "scheduled"'
    );

    res.json({
      success: true,
      message: `Webinars API is working! Found ${result[0].count} scheduled webinars.`,
      count: result[0].count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Webinars API health check failed: " + error.message,
    });
  }
};

// Get all webinars for admin
export const getAdminWebinars = async (req, res) => {
  try {
    const [webinars] = await db.execute(`
      SELECT id, title, description, speaker, speaker_bio, date, duration, 
             max_attendees, current_attendees, join_link, recording_link,
             status, image_url, price, is_premium, category, tags,
             created_at, updated_at
      FROM webinars 
      ORDER BY date DESC
    `);

    const webinarsWithSafeTags = webinars.map(parseWebinarTags);

    res.json({
      success: true,
      data: {
        webinars: webinarsWithSafeTags,
      },
    });
  } catch (error) {
    console.error("❌ Get admin webinars error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinars",
    });
  }
};

// Get webinar registrations
export const getWebinarRegistrations = async (req, res) => {
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
        total: registrations.length,
      },
    });
  } catch (error) {
    console.error("❌ Get webinar registrations error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinar registrations",
    });
  }
};

// Create webinar
export const createWebinar = async (req, res) => {
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
    } = req.body;

    console.log("📥 Creating webinar with data:", req.body);

    if (
      !title ||
      !description ||
      !speaker ||
      !date ||
      !duration ||
      !max_attendees
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, speaker, date, duration, and max_attendees are required fields",
      });
    }

    let tagsValue = null;
    if (tags) {
      if (Array.isArray(tags)) {
        tagsValue = JSON.stringify(tags);
      } else if (typeof tags === "string") {
        const tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
        tagsValue = JSON.stringify(tagsArray);
      }
    }

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
        price ? parseFloat(price) : 0.0,
        is_premium ? 1 : 0,
        category || "Education",
        tagsValue,
        status || "scheduled",
        null, // image_url - will be handled by upload route
      ]
    );

    const [webinars] = await db.execute("SELECT * FROM webinars WHERE id = ?", [
      result.insertId,
    ]);

    const createdWebinar = parseWebinarTags(webinars[0]);

    console.log(`✅ New webinar created: ${title} by ${speaker}`);

    res.status(201).json({
      success: true,
      message: "Webinar created successfully",
      data: {
        webinar: createdWebinar,
      },
    });
  } catch (error) {
    console.error("❌ Create webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating webinar: " + error.message,
    });
  }
};

// Update webinar
export const updateWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📥 Admin: Updating webinar ${id} with data:`, updateData);

    const [existingWebinars] = await db.execute(
      "SELECT id FROM webinars WHERE id = ?",
      [id]
    );

    if (existingWebinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "speaker",
      "speaker_bio",
      "date",
      "duration",
      "max_attendees",
      "join_link",
      "recording_link",
      "price",
      "is_premium",
      "category",
      "tags",
      "status",
      "image_url",
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);

        if (key === "duration" || key === "max_attendees") {
          values.push(parseInt(updateData[key]));
        } else if (key === "price") {
          values.push(parseFloat(updateData[key]) || 0.0);
        } else if (key === "is_premium") {
          values.push(updateData[key] === "true" ? 1 : 0);
        } else if (key === "date") {
          values.push(new Date(updateData[key]));
        } else if (key === "tags" && updateData[key]) {
          let tagsValue = null;
          if (Array.isArray(updateData[key])) {
            tagsValue = JSON.stringify(updateData[key]);
          } else if (typeof updateData[key] === "string") {
            const tagsArray = updateData[key]
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag !== "");
            tagsValue = JSON.stringify(tagsArray);
          }
          values.push(tagsValue);
        } else {
          values.push(updateData[key]);
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const query = `UPDATE webinars SET ${updates.join(", ")} WHERE id = ?`;

    await db.execute(query, values);

    const [webinars] = await db.execute("SELECT * FROM webinars WHERE id = ?", [
      id,
    ]);

    const updatedWebinar = parseWebinarTags(webinars[0]);

    console.log(`✅ Admin: Webinar updated: ID ${id}`);

    res.json({
      success: true,
      message: "Webinar updated successfully",
      data: {
        webinar: updatedWebinar,
      },
    });
  } catch (error) {
    console.error("❌ Admin: Update webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating webinar: " + error.message,
    });
  }
};

// Delete webinar
export const deleteWebinar = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingWebinars] = await db.execute(
      "SELECT id, title FROM webinars WHERE id = ?",
      [id]
    );

    if (existingWebinars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    const webinarTitle = existingWebinars[0].title;

    await db.execute("DELETE FROM webinar_registrations WHERE webinar_id = ?", [
      id,
    ]);

    await db.execute("DELETE FROM webinars WHERE id = ?", [id]);

    console.log(`🗑️ Webinar deleted: ${webinarTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: "Webinar deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting webinar: " + error.message,
    });
  }
};
