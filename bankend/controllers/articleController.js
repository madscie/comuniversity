import db from "../config/database.js";

// Helper function for building article queries
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
    query += " AND category = ?";
    params.push(category);
  }

  if (search) {
    query += " AND (title LIKE ? OR author LIKE ? OR excerpt LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  return { query, params };
};

// Parse article tags safely
const parseArticleTags = (article) => ({
  ...article,
  tags: article.tags
    ? typeof article.tags === "string"
      ? JSON.parse(article.tags)
      : article.tags
    : [],
  amount: parseFloat(article.amount) || 0,
  file_size: article.file_size ? parseInt(article.file_size) : null,
});

// Get all published articles
export const getArticles = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    console.log("📄 Fetching articles with params:", {
      category,
      search,
      page,
      limit,
    });

    const { query: baseQuery, params: baseParams } = buildArticlesQuery({
      category,
      search,
    });

    const query = `${baseQuery} ORDER BY created_at DESC`;
    const params = [...baseParams];

    console.log("🔍 Base query:", query);
    console.log("📊 Base params:", params);

    // Execute query without LIMIT/OFFSET first
    const [allArticles] = await db.execute(query, params);

    // Apply pagination manually in JavaScript
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedArticles = allArticles.slice(startIndex, endIndex);

    console.log(
      `✅ Found ${allArticles.length} total articles, showing ${paginatedArticles.length} after pagination`
    );

    // Parse tags safely
    const articlesWithParsedTags = paginatedArticles.map(parseArticleTags);

    res.json({
      success: true,
      data: {
        articles: articlesWithParsedTags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allArticles.length,
          pages: Math.ceil(allArticles.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get articles error:", error.message);
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
      "SELECT * FROM articles WHERE id = ? AND status = 'published'",
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const article = articles[0];

    // Update view count
    await db.execute("UPDATE articles SET views = views + 1 WHERE id = ?", [
      id,
    ]);

    // Parse tags and other fields
    const parsedArticle = parseArticleTags(article);

    res.json({
      success: true,
      data: { article: parsedArticle },
    });
  } catch (error) {
    console.error("❌ Get article error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching article",
    });
  }
};

// Get article categories
export const getArticleCategories = async (req, res) => {
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
        categories: categories.map((cat) => cat.category),
      },
    });
  } catch (error) {
    console.error("❌ Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
};

// Get featured articles
export const getFeaturedArticles = async (req, res) => {
  try {
    const [articles] = await db.execute(`
      SELECT id, title, excerpt, author, category, image_url, views,
             read_time, published_date, tags, file_url, file_name,
             file_type, file_size, amount
      FROM articles
      WHERE status = 'published' AND featured = 1
      ORDER BY created_at DESC
      LIMIT 6
    `);

    const articlesWithParsedTags = articles.map(parseArticleTags);

    res.json({
      success: true,
      data: { articles: articlesWithParsedTags },
    });
  } catch (error) {
    console.error("❌ Get featured articles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured articles",
    });
  }
};

// Download article document
export const downloadArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const [articles] = await db.execute(
      "SELECT file_url, file_name, file_type FROM articles WHERE id = ? AND status = 'published'",
      [id]
    );

    if (articles.length === 0 || !articles[0].file_url) {
      return res.status(404).json({
        success: false,
        message: "Article or document not found",
      });
    }

    const article = articles[0];
    res.redirect(`http://localhost:5000${article.file_url}`);
  } catch (error) {
    console.error("❌ Download article document error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading document",
    });
  }
};

// Get all articles for admin (including drafts)
export const getAdminArticles = async (req, res) => {
  try {
    console.log("📄 Admin: Fetching all articles...");

    const [articles] = await db.execute(`
      SELECT id, title, content, excerpt, author, category, image_url, 
             views, read_time, published_date, status, featured, tags,
             dewey_decimal, amount, file_url, file_name, file_size, file_type,
             created_at, updated_at
      FROM articles 
      ORDER BY created_at DESC
    `);

    const articlesWithParsedTags = articles.map(parseArticleTags);

    console.log(`✅ Admin: Found ${articles.length} articles`);

    res.json({
      success: true,
      data: {
        articles: articlesWithParsedTags,
      },
    });
  } catch (error) {
    console.error("❌ Admin: Get articles error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching articles: " + error.message,
    });
  }
};

// Create article
export const createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      author,
      category,
      read_time,
      status,
      featured,
      tags,
      dewey_decimal,
      amount,
    } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, author, and category are required fields",
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
      `INSERT INTO articles (
        title, content, excerpt, author, category, image_url,
        read_time, status, featured, tags, dewey_decimal, amount,
        file_url, file_name, file_type, file_size, published_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content || "",
        excerpt || "",
        author,
        category,
        null, // image_url - will be handled by upload route
        parseInt(read_time) || 5,
        status || "draft",
        featured === "true" ? 1 : 0,
        tagsValue,
        dewey_decimal || null,
        amount ? parseFloat(amount) : 0.0,
        null, // file_url - will be handled by upload route
        null, // file_name
        null, // file_type
        null, // file_size
        status === "published" ? new Date().toISOString().split("T")[0] : null,
      ]
    );

    const [articles] = await db.execute("SELECT * FROM articles WHERE id = ?", [
      result.insertId,
    ]);

    const createdArticle = parseArticleTags(articles[0]);

    console.log(`✅ Admin: New article created: ${title} by ${author}`);

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: {
        article: createdArticle,
      },
    });
  } catch (error) {
    console.error("❌ Admin: Create article error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating article: " + error.message,
    });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [existingArticles] = await db.execute(
      "SELECT id FROM articles WHERE id = ?",
      [id]
    );

    if (existingArticles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const allowedFields = [
      "title",
      "content",
      "excerpt",
      "author",
      "category",
      "read_time",
      "status",
      "featured",
      "tags",
      "dewey_decimal",
      "amount",
      "image_url",
      "file_url",
      "file_name",
      "file_type",
      "file_size",
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);

        if (key === "read_time") {
          values.push(parseInt(updateData[key]));
        } else if (key === "featured") {
          values.push(updateData[key] === "true" ? 1 : 0);
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
        } else if (key === "amount") {
          values.push(updateData[key] ? parseFloat(updateData[key]) : 0.0);
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

    // Add published_date if status is being updated to published
    if (updateData.status === "published") {
      updates.push("published_date = ?");
      values.push(new Date().toISOString().split("T")[0]);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const query = `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`;

    await db.execute(query, values);

    const [articles] = await db.execute("SELECT * FROM articles WHERE id = ?", [
      id,
    ]);

    const updatedArticle = parseArticleTags(articles[0]);

    console.log(`✅ Admin: Article updated: ID ${id}`);

    res.json({
      success: true,
      message: "Article updated successfully",
      data: {
        article: updatedArticle,
      },
    });
  } catch (error) {
    console.error("❌ Admin: Update article error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating article: " + error.message,
    });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

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

    await db.execute("DELETE FROM articles WHERE id = ?", [id]);

    console.log(`🗑️ Admin: Article deleted: ${articleTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("❌ Admin: Delete article error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting article: " + error.message,
    });
  }
};
