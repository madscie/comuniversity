const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET all webinars
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM webinars ORDER BY date DESC");
    // normalize isUpcoming for frontend
    const webinars = rows.map(w => ({ ...w, isUpcoming: w.isUpcoming === 1 }));
    res.json(webinars);
  } catch (error) {
    console.error("Error fetching webinars:", error);
    res.status(500).json({ message: "Error fetching webinars" });
  }
});

// POST a new webinar
router.post("/", async (req, res) => {
  try {
    const { title, description, date, duration, speaker, joinLink, recordingLink, isUpcoming } = req.body;
    const [result] = await pool.query(
      `INSERT INTO webinars 
       (title, description, date, duration, speaker, joinLink, recordingLink, isUpcoming)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, duration, speaker, joinLink, recordingLink, isUpcoming]
    );
    res.json({ id: result.insertId, message: "Webinar added successfully" });
  } catch (error) {
    console.error("Error adding webinar:", error);
    res.status(500).json({ message: "Error adding webinar" });
  }
});

module.exports = router;
