import db from "../config/database.js";
import { cloudinary, testCloudinaryConnection } from "../config/cloudinary.js";

// Helper function for building queries
const buildArticlesQuery = (filters = {}) => {
  let query = `
    SELECT id, title, content, excerpt, author, category, image_url,
           views, read_time, published_date, status, featured, tags,
           dewey_decimal, amount, file_url, file_name, file_size,
           file_type, created_at, updated_at
    FROM articles 
    WHERE status = 'published'
  `;
  const params = [];

  const { category, search } = filters;

  if (category && category !== "all") {
    query += ` AND category = ?`;
    params.push(category);
  }

  if (search) {
    query += ` AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  return { query, params };
};

// Get all articles with filtering and pagination
export const getArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      includeAll = false,
      status = "published",
    } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    console.log("=== ARTICLES API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Offset:", offset);
    console.log("Include All:", includeAll, "Status:", status);

    let query = `
      SELECT id, title, content, excerpt, author, category, image_url,
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, amount, file_url, file_name, file_size,
             file_type, created_at, updated_at
      FROM articles 
      WHERE 1=1
    `;

    let params = [];

    // Only filter by status if not including all articles
    if (!includeAll) {
      query += ` AND status = ?`;
      params.push(status);
    }

    // Add filters
    if (category && category !== "all") {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    console.log("Final Query:", query);
    console.log("Params:", params);

    const [articles] = await db.execute(query, params);

    // Get total count (similar logic without LIMIT/OFFSET)
    let countQuery = `SELECT COUNT(*) as total FROM articles WHERE 1=1`;
    let countParams = [];

    if (!includeAll) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (category && category !== "all") {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }

    if (search) {
      countQuery += ` AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    console.log(
      `📊 Returning ${articles.length} articles out of ${total} total`
    );

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        filters: {
          includeAll,
          status,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get articles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching articles: " + error.message,
    });
  }
};

// Get single article by ID
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await db.execute(
      `SELECT * FROM articles WHERE id = ? AND status = 'published'`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.json({
      success: true,
      data: {
        article: articles[0],
      },
    });
  } catch (error) {
    console.error("❌ Get article error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching article",
    });
  }
};

// Test Cloudinary on startup
testCloudinaryConnection();

// Improved upload function with better error handling
const uploadToCloudinary = async (file, folder = "articles") => {
  try {
    if (!file || !file.path) {
      throw new Error("Invalid file provided");
    }

    console.log(
      `☁️ Uploading to Cloudinary: ${file.originalname} -> ${folder}`
    );

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: "auto",
      timeout: 60000, // 60 second timeout
    });

    console.log(`✅ Cloudinary upload successful: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Helper function to safely handle values
const safeValue = (value) => {
  if (value === undefined || value === "") return null;
  return value;
};

const safeNumber = (value) => {
  if (value === undefined || value === "") return null;
  return parseInt(value);
};

// Create article - MIRRORING BOOK CREATION
export const createArticle = async (req, res) => {
  try {
    console.log("📥 CREATE ARTICLE REQUEST BODY:", req.body);
    console.log("📁 FILES RECEIVED:", req.files);

    const {
      title,
      author,
      content,
      excerpt,
      category,
      read_time,
      status,
      featured,
      tags,
      dewey_decimal,
    } = req.body;

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, author, and category are required",
      });
    }

    // Handle file uploads
    let imageUrl = null;
    let documentUrl = null;

    if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];
      imageUrl = imageFile.filename;
      console.log("🖼️ Article image path:", imageUrl);
    }

    if (req.files?.document?.[0]) {
      const documentFile = req.files.document[0];
      documentUrl = documentFile.filename;
      console.log("📄 Article document path:", documentUrl);
    }

    // Handle tags properly - FIXED: Check if tags is already an array
    let tagsValue = null;
    if (tags) {
      if (Array.isArray(tags)) {
        tagsValue = JSON.stringify(tags);
      } else if (typeof tags === "string") {
        // Handle comma-separated string
        const tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
        tagsValue = JSON.stringify(tagsArray);
      }
    }

    console.log("💾 CREATING ARTICLE WITH DATA:", {
      title,
      author,
      category,
      imageUrl,
      documentUrl,
      tagsValue,
    });

    const [result] = await db.execute(
      `INSERT INTO articles (
        title, content, excerpt, author, category, image_url, 
        read_time, status, featured, tags, dewey_decimal,
        file_url, file_name, file_type, file_size, published_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeValue(title),
        safeValue(content) || "",
        safeValue(excerpt) || "",
        safeValue(author),
        safeValue(category),
        safeValue(imageUrl),
        parseInt(read_time) || 5,
        safeValue(status) || "draft",
        featured ? 1 : 0,
        tagsValue,
        safeValue(dewey_decimal),
        safeValue(documentUrl),
        req.files?.document?.[0]?.originalname || null,
        req.files?.document?.[0]?.mimetype || null,
        req.files?.document?.[0]?.size || null,
        status === "published" ? new Date().toISOString().split("T")[0] : null,
      ]
    );

    const [newArticle] = await db.execute(
      "SELECT * FROM articles WHERE id = ?",
      [result.insertId]
    );

    console.log("✅ ARTICLE CREATED SUCCESSFULLY, ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: {
        article: newArticle[0],
      },
    });
  } catch (error) {
    console.error("❌ CREATE ARTICLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create article",
      error: error.message,
    });
  }
};

// Update article status
export const updateArticleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("🔄 Updating article status:", { id, status });

    // Check if article exists
    const [existingArticle] = await db.execute(
      "SELECT * FROM articles WHERE id = ?",
      [id]
    );

    if (existingArticle.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    await db.execute(
      `UPDATE articles SET 
        status = ?, updated_at = CURRENT_TIMESTAMP,
        published_date = ?
      WHERE id = ?`,
      [
        status,
        status === "published" ? new Date().toISOString().split("T")[0] : null,
        id,
      ]
    );

    console.log("✅ ARTICLE STATUS UPDATED SUCCESSFULLY, ID:", id);

    res.json({
      success: true,
      message: "Article status updated successfully",
    });
  } catch (error) {
    console.error("❌ UPDATE ARTICLE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update article status",
      error: error.message,
    });
  }
};

// Update article - MIRRORING BOOK UPDATE
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📥 UPDATE ARTICLE REQUEST:", {
      id,
      body: req.body,
      files: req.files,
    });

    // Check if article exists
    const [existingArticle] = await db.execute(
      "SELECT * FROM articles WHERE id = ?",
      [id]
    );

    if (existingArticle.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const {
      title,
      author,
      content,
      excerpt,
      category,
      read_time,
      status,
      featured,
      tags,
      dewey_decimal,
    } = req.body;

    // Use existing values if not provided
    const currentArticle = existingArticle[0];
    const finalTitle = title || currentArticle.title;
    const finalAuthor = author || currentArticle.author;
    const finalCategory = category || currentArticle.category;

    // Use existing file URLs unless new files are provided
    let imageUrl = currentArticle.image_url;
    let documentUrl = currentArticle.file_url;
    let fileName = currentArticle.file_name;
    let fileType = currentArticle.file_type;
    let fileSize = currentArticle.file_size;

    // Handle file uploads
    if (req.files && req.files.image && req.files.image[0]) {
      const imageFile = req.files.image[0];
      imageUrl = imageFile.filename;
      console.log("🖼️ New article image uploaded:", imageUrl);
    }

    if (req.files && req.files.document && req.files.document[0]) {
      const documentFile = req.files.document[0];
      documentUrl = documentFile.filename;
      fileName = documentFile.originalname;
      fileType = documentFile.mimetype;
      fileSize = documentFile.size;
      console.log("📄 New article document uploaded:", documentUrl);
    }

    // Handle tags properly - FIXED: Check if tags is already an array
    let tagsValue = currentArticle.tags;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        tagsValue = JSON.stringify(tags);
      } else if (typeof tags === "string") {
        if (tags.trim() === "") {
          tagsValue = null;
        } else {
          const tagsArray = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "");
          tagsValue = JSON.stringify(tagsArray);
        }
      }
    }

    console.log("💾 UPDATING ARTICLE WITH DATA:", {
      finalTitle,
      finalAuthor,
      finalCategory,
      imageUrl,
      documentUrl,
    });

    await db.execute(
      `UPDATE articles SET 
        title = ?, content = ?, excerpt = ?, author = ?, category = ?, 
        image_url = ?, read_time = ?, status = ?, featured = ?, tags = ?, 
        dewey_decimal = ?, file_url = ?, file_name = ?, file_type = ?, 
        file_size = ?, updated_at = CURRENT_TIMESTAMP,
        published_date = ?
      WHERE id = ?`,
      [
        safeValue(finalTitle),
        safeValue(content),
        safeValue(excerpt),
        safeValue(finalAuthor),
        safeValue(finalCategory),
        safeValue(imageUrl),
        parseInt(read_time) || 5,
        safeValue(status) || "draft",
        featured ? 1 : 0,
        tagsValue,
        safeValue(dewey_decimal),
        safeValue(documentUrl),
        safeValue(fileName),
        safeValue(fileType),
        safeValue(fileSize),
        status === "published"
          ? new Date().toISOString().split("T")[0]
          : currentArticle.published_date,
        id,
      ]
    );

    const [updatedArticle] = await db.execute(
      "SELECT * FROM articles WHERE id = ?",
      [id]
    );

    console.log("✅ ARTICLE UPDATED SUCCESSFULLY, ID:", id);

    res.json({
      success: true,
      message: "Article updated successfully",
      data: {
        article: updatedArticle[0],
      },
    });
  } catch (error) {
    console.error("❌ UPDATE ARTICLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update article",
      error: error.message,
    });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const [existingArticles] = await db.execute(
      "SELECT id, title FROM articles WHERE id = ?",
      [id]
    );

    if (existingArticles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const articleTitle = existingArticles[0].title;

    // Delete the article
    await db.execute("DELETE FROM articles WHERE id = ?", [id]);

    console.log(`🗑️ Article deleted: ${articleTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete article error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting article: " + error.message,
    });
  }
};

// Get featured articles
export const getFeaturedArticles = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const [articles] = await db.execute(
      `SELECT id, title, excerpt, author, category, image_url, views, read_time
       FROM articles 
       WHERE featured = TRUE AND status = 'published'
       ORDER BY created_at DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: {
        articles,
      },
    });
  } catch (error) {
    console.error("❌ Get featured articles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured articles",
    });
  }
};

// Get articles by category
export const getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const [articles] = await db.execute(
      `SELECT id, title, excerpt, author, category, image_url, views, read_time
       FROM articles 
       WHERE category = ? AND status = 'published'
       ORDER BY created_at DESC 
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
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get articles by category error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching articles by category",
    });
  }
};

// Search articles
export const searchArticles = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const [articles] = await db.execute(
      `SELECT id, title, excerpt, author, category, image_url, views, read_time
       FROM articles 
       WHERE (title LIKE ? OR author LIKE ? OR excerpt LIKE ?) 
       AND status = 'published'
       ORDER BY 
         CASE 
           WHEN title LIKE ? THEN 1
           WHEN author LIKE ? THEN 2
           ELSE 3
         END,
         created_at DESC
       LIMIT ? OFFSET ?`,
      [
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        parseInt(limit),
        offset,
      ]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM articles 
       WHERE (title LIKE ? OR author LIKE ? OR excerpt LIKE ?) 
       AND status = 'published'`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
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
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Search articles error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching articles",
    });
  }
};

// Get categories
export const getArticleCategories = async (req, res) => {
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
      data: categories,
    });
  } catch (error) {
    console.error("❌ Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
};

// Get all articles for admin (including drafts)
export const getAdminArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      status = "all",
    } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    console.log("=== ADMIN ARTICLES API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Offset:", offset);
    console.log("Status:", status);

    let query = `
      SELECT id, title, content, excerpt, author, category, image_url,
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, amount, file_url, file_name, file_size,
             file_type, created_at, updated_at
      FROM articles 
      WHERE 1=1
    `;

    let params = [];

    // Filter by status if not "all"
    if (status !== "all") {
      query += ` AND status = ?`;
      params.push(status);
    }

    // Add filters
    if (category && category !== "all") {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    console.log("Final Admin Query:", query);
    console.log("Admin Params:", params);

    const [articles] = await db.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM articles WHERE 1=1`;
    let countParams = [];

    if (status !== "all") {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (category && category !== "all") {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }

    if (search) {
      countQuery += ` AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    console.log(
      `📊 Admin: Returning ${articles.length} articles out of ${total} total`
    );

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("❌ Admin: Get articles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching articles: " + error.message,
    });
  }
};

// Download article document
export const downloadArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const [articles] = await db.execute(
      "SELECT file_url, file_name FROM articles WHERE id = ? AND status = 'published'",
      [id]
    );

    if (articles.length === 0 || !articles[0].file_url) {
      return res.status(404).json({
        success: false,
        message: "Article or document not found",
      });
    }

    const article = articles[0];

    // Serve the file
    res.json({
      success: true,
      data: {
        download_url: `/uploads/${article.file_url}`,
        file_name: article.file_name,
      },
    });
  } catch (error) {
    console.error("❌ Download article document error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading document",
    });
  }
};
