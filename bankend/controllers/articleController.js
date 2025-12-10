import { getCollection } from "../config/database.js";
import { ObjectId } from "mongodb";

// Helper functions remain the same (no MySQL dependency)
const safeValue = (value) => {
  if (value === undefined || value === "" || value === "null") return null;
  return value;
};

const safeNumber = (value) => {
  if (value === undefined || value === "" || value === "null") return null;
  return parseInt(value);
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
    const skip = (pageNum - 1) * limitNum;

    console.log("=== ARTICLES API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Skip:", skip);
    console.log("Include All:", includeAll, "Status:", status);

    const contentCollection = await getCollection("content");

    // Build MongoDB query
    const query = { type: "article" };
    
    // Only filter by status if not including all articles
    if (!includeAll) {
      query["metadata.article.status"] = status;
    }

    // Add filters
    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    console.log("MongoDB Query:", JSON.stringify(query, null, 2));

    // Get articles with pagination
    const articlesCursor = contentCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        content: 1,
        excerpt: 1,
        author: 1,
        category: 1,
        "metadata.article.imageUrl": 1,
        "metadata.article.views": 1,
        "metadata.article.readingTime": 1,
        "metadata.article.publishedDate": 1,
        "metadata.article.status": 1,
        featured: 1,
        tags: 1,
        deweyDecimal: 1,
        amount: 1,
        "metadata.article.file.url": 1,
        "metadata.article.file.name": 1,
        "metadata.article.file.size": 1,
        "metadata.article.file.type": 1,
        createdAt: 1,
        updatedAt: 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

    const articles = await articlesCursor.toArray();

    // Get total count
    const total = await contentCollection.countDocuments(query);

    console.log(`📊 Returning ${articles.length} articles out of ${total} total`);

    // Transform articles to match expected format
    const transformedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      image_url: article.metadata?.article?.imageUrl || null,
      views: article.metadata?.article?.views || 0,
      read_time: article.metadata?.article?.readingTime || 5,
      published_date: article.metadata?.article?.publishedDate || article.createdAt,
      status: article.metadata?.article?.status || "draft",
      featured: article.featured || false,
      tags: article.tags || [],
      dewey_decimal: article.deweyDecimal || null,
      amount: article.amount || 0.0,
      file_url: article.metadata?.article?.file?.url || null,
      file_name: article.metadata?.article?.file?.name || null,
      file_size: article.metadata?.article?.file?.size || null,
      file_type: article.metadata?.article?.file?.type || null,
      created_at: article.createdAt,
      updated_at: article.updatedAt
    }));

    res.json({
      success: true,
      data: {
        articles: transformedArticles,
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

    const contentCollection = await getCollection("content");

    const article = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "article",
      "metadata.article.status": "published"
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Transform article to match expected format
    const transformedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      image_url: article.metadata?.article?.imageUrl || null,
      views: article.metadata?.article?.views || 0,
      read_time: article.metadata?.article?.readingTime || 5,
      published_date: article.metadata?.article?.publishedDate || article.createdAt,
      status: article.metadata?.article?.status || "draft",
      featured: article.featured || false,
      tags: article.tags || [],
      dewey_decimal: article.deweyDecimal || null,
      amount: article.amount || 0.0,
      file_url: article.metadata?.article?.file?.url || null,
      file_name: article.metadata?.article?.file?.name || null,
      file_size: article.metadata?.article?.file?.size || null,
      file_type: article.metadata?.article?.file?.type || null,
      created_at: article.createdAt,
      updated_at: article.updatedAt
    };

    res.json({
      success: true,
      data: {
        article: transformedArticle,
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

// Create article function - UPDATED FOR MONGODB
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
      amount,
    } = req.body;

    // Validate required fields
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, author, and category are required",
      });
    }

    const contentCollection = await getCollection("content");

    // Handle file uploads
    let imageUrl = null;
    let documentData = null;

    if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];
      imageUrl = imageFile.filename;
      console.log("🖼️ Article image saved:", imageUrl);
    }

    if (req.files?.document?.[0]) {
      const documentFile = req.files.document[0];
      documentData = {
        url: documentFile.filename,
        name: documentFile.originalname,
        type: documentFile.mimetype,
        size: documentFile.size,
        downloadCount: 0
      };
      console.log("📄 Article document saved:", documentData.url);
    }

    // Handle tags properly
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      }
    }

    console.log("💾 CREATING ARTICLE WITH DATA:", {
      title,
      author,
      category,
      imageUrl,
      documentData,
    });

    // Create article document
    const articleDocument = {
      contentId: `ART-${Date.now()}`,
      type: "article",
      title: safeValue(title),
      author: safeValue(author),
      content: safeValue(content) || "",
      excerpt: safeValue(excerpt) || "",
      category: safeValue(category),
      tags: tagsArray,
      deweyDecimal: safeValue(dewey_decimal),
      amount: parseFloat(amount) || 0.0,
      featured: !!featured,
      
      metadata: {
        article: {
          imageUrl: safeValue(imageUrl),
          readingTime: parseInt(read_time) || 5,
          status: safeValue(status) || "draft",
          publishedDate: status === "published" ? new Date() : null,
          file: documentData,
          views: 0
        }
      },
      
      statistics: {
        views: 0,
        shares: 0,
        comments: 0
      },
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await contentCollection.insertOne(articleDocument);
    
    // Get the created article
    const newArticle = await contentCollection.findOne({ _id: result.insertedId });

    console.log("✅ ARTICLE CREATED SUCCESSFULLY, ID:", result.insertedId);

    // Transform response
    const transformedArticle = {
      id: newArticle._id,
      title: newArticle.title,
      content: newArticle.content,
      excerpt: newArticle.excerpt,
      author: newArticle.author,
      category: newArticle.category,
      image_url: newArticle.metadata?.article?.imageUrl || null,
      views: newArticle.metadata?.article?.views || 0,
      read_time: newArticle.metadata?.article?.readingTime || 5,
      published_date: newArticle.metadata?.article?.publishedDate || newArticle.createdAt,
      status: newArticle.metadata?.article?.status || "draft",
      featured: newArticle.featured || false,
      tags: newArticle.tags || [],
      dewey_decimal: newArticle.deweyDecimal || null,
      amount: newArticle.amount || 0.0,
      file_url: newArticle.metadata?.article?.file?.url || null,
      file_name: newArticle.metadata?.article?.file?.name || null,
      file_size: newArticle.metadata?.article?.file?.size || null,
      file_type: newArticle.metadata?.article?.file?.type || null,
      created_at: newArticle.createdAt,
      updated_at: newArticle.updatedAt
    };

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: {
        article: transformedArticle,
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

// Update article function - UPDATED FOR MONGODB
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📥 UPDATE ARTICLE REQUEST:", {
      id,
      body: req.body,
      files: req.files,
    });

    const contentCollection = await getCollection("content");

    // Check if article exists
    const existingArticle = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "article"
    });

    if (!existingArticle) {
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
      amount,
    } = req.body;

    // Prepare update operations
    const updateFields = {};
    const updateOperations = { $set: {} };

    // Update basic fields
    if (title !== undefined) updateOperations.$set.title = safeValue(title);
    if (author !== undefined) updateOperations.$set.author = safeValue(author);
    if (content !== undefined) updateOperations.$set.content = safeValue(content);
    if (excerpt !== undefined) updateOperations.$set.excerpt = safeValue(excerpt);
    if (category !== undefined) updateOperations.$set.category = safeValue(category);
    if (dewey_decimal !== undefined) updateOperations.$set.deweyDecimal = safeValue(dewey_decimal);
    if (amount !== undefined) updateOperations.$set.amount = parseFloat(amount) || 0.0;
    if (featured !== undefined) updateOperations.$set.featured = !!featured;

    // Handle tags
    if (tags !== undefined) {
      let tagsArray = [];
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string" && tags.trim() !== "") {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      }
      updateOperations.$set.tags = tagsArray;
    }

    // Handle file uploads
    const currentArticle = existingArticle.metadata?.article || {};
    
    if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];
      updateOperations.$set["metadata.article.imageUrl"] = imageFile.filename;
      console.log("🖼️ New article image uploaded:", imageFile.filename);
    }

    if (req.files?.document?.[0]) {
      const documentFile = req.files.document[0];
      updateOperations.$set["metadata.article.file"] = {
        url: documentFile.filename,
        name: documentFile.originalname,
        type: documentFile.mimetype,
        size: documentFile.size,
        downloadCount: currentArticle.file?.downloadCount || 0
      };
      console.log("📄 New article document uploaded:", documentFile.filename);
    }

    // Update article metadata
    if (read_time !== undefined) {
      updateOperations.$set["metadata.article.readingTime"] = parseInt(read_time) || 5;
    }

    if (status !== undefined) {
      updateOperations.$set["metadata.article.status"] = safeValue(status) || "draft";
      
      // Set published date if publishing
      if (status === "published" && !currentArticle.publishedDate) {
        updateOperations.$set["metadata.article.publishedDate"] = new Date();
      }
    }

    // Always update timestamp
    updateOperations.$set.updatedAt = new Date();

    // Perform update
    const result = await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperations
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes made to article",
      });
    }

    // Get updated article
    const updatedArticle = await contentCollection.findOne({ _id: new ObjectId(id) });

    console.log("✅ ARTICLE UPDATED SUCCESSFULLY, ID:", id);

    // Transform response
    const transformedArticle = {
      id: updatedArticle._id,
      title: updatedArticle.title,
      content: updatedArticle.content,
      excerpt: updatedArticle.excerpt,
      author: updatedArticle.author,
      category: updatedArticle.category,
      image_url: updatedArticle.metadata?.article?.imageUrl || null,
      views: updatedArticle.metadata?.article?.views || 0,
      read_time: updatedArticle.metadata?.article?.readingTime || 5,
      published_date: updatedArticle.metadata?.article?.publishedDate || updatedArticle.createdAt,
      status: updatedArticle.metadata?.article?.status || "draft",
      featured: updatedArticle.featured || false,
      tags: updatedArticle.tags || [],
      dewey_decimal: updatedArticle.deweyDecimal || null,
      amount: updatedArticle.amount || 0.0,
      file_url: updatedArticle.metadata?.article?.file?.url || null,
      file_name: updatedArticle.metadata?.article?.file?.name || null,
      file_size: updatedArticle.metadata?.article?.file?.size || null,
      file_type: updatedArticle.metadata?.article?.file?.type || null,
      created_at: updatedArticle.createdAt,
      updated_at: updatedArticle.updatedAt
    };

    res.json({
      success: true,
      message: "Article updated successfully",
      data: {
        article: transformedArticle,
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

// Update article status
export const updateArticleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("🔄 Updating article status:", { id, status });

    const contentCollection = await getCollection("content");

    // Check if article exists
    const existingArticle = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "article"
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const updateData = {
      $set: {
        "metadata.article.status": status,
        updatedAt: new Date()
      }
    };

    // Set published date if publishing
    if (status === "published" && !existingArticle.metadata?.article?.publishedDate) {
      updateData.$set["metadata.article.publishedDate"] = new Date();
    }

    await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      updateData
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

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const contentCollection = await getCollection("content");

    // Check if article exists
    const existingArticle = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "article"
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const articleTitle = existingArticle.title;

    // Delete the article
    await contentCollection.deleteOne({ _id: new ObjectId(id) });

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

    const contentCollection = await getCollection("content");

    const articlesCursor = contentCollection.find({
      type: "article",
      featured: true,
      "metadata.article.status": "published"
    }, {
      projection: {
        _id: 1,
        title: 1,
        excerpt: 1,
        author: 1,
        category: 1,
        "metadata.article.imageUrl": 1,
        "metadata.article.views": 1,
        "metadata.article.readingTime": 1
      }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    const articles = await articlesCursor.toArray();

    // Transform articles
    const transformedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      image_url: article.metadata?.article?.imageUrl || null,
      views: article.metadata?.article?.views || 0,
      read_time: article.metadata?.article?.readingTime || 5
    }));

    res.json({
      success: true,
      data: {
        articles: transformedArticles,
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
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contentCollection = await getCollection("content");

    const query = {
      type: "article",
      category: category,
      "metadata.article.status": "published"
    };

    const articlesCursor = contentCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        excerpt: 1,
        author: 1,
        category: 1,
        "metadata.article.imageUrl": 1,
        "metadata.article.views": 1,
        "metadata.article.readingTime": 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const articles = await articlesCursor.toArray();

    // Get total count
    const total = await contentCollection.countDocuments(query);

    // Transform articles
    const transformedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      image_url: article.metadata?.article?.imageUrl || null,
      views: article.metadata?.article?.views || 0,
      read_time: article.metadata?.article?.readingTime || 5
    }));

    res.json({
      success: true,
      data: {
        articles: transformedArticles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
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
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const contentCollection = await getCollection("content");

    // MongoDB text search
    const searchQuery = {
      type: "article",
      "metadata.article.status": "published",
      $text: { $search: query }
    };

    const articlesCursor = contentCollection.find(searchQuery, {
      projection: {
        _id: 1,
        title: 1,
        excerpt: 1,
        author: 1,
        category: 1,
        "metadata.article.imageUrl": 1,
        "metadata.article.views": 1,
        "metadata.article.readingTime": 1,
        score: { $meta: "textScore" }
      }
    })
    .sort({ score: { $meta: "textScore" }, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const articles = await articlesCursor.toArray();

    // Get total count
    const total = await contentCollection.countDocuments(searchQuery);

    // Transform articles
    const transformedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      image_url: article.metadata?.article?.imageUrl || null,
      views: article.metadata?.article?.views || 0,
      read_time: article.metadata?.article?.readingTime || 5
    }));

    res.json({
      success: true,
      data: {
        articles: transformedArticles,
        query,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
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
    const contentCollection = await getCollection("content");

    const categories = await contentCollection.aggregate([
      {
        $match: {
          type: "article",
          "metadata.article.status": "published"
        }
      },
      {
        $group: {
          _id: "$category",
          article_count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          article_count: 1,
          _id: 0
        }
      },
      {
        $sort: { article_count: -1 }
      }
    ]).toArray();

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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log("=== ADMIN ARTICLES API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Skip:", skip);
    console.log("Status:", status);

    const contentCollection = await getCollection("content");

    // Build query
    const query = { type: "article" };
    
    // Filter by status if not "all"
    if (status !== "all") {
      query["metadata.article.status"] = status;
    }

    // Add filters
    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    console.log("MongoDB Admin Query:", JSON.stringify(query, null, 2));

    const articlesCursor = contentCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        content: 1,
        excerpt: 1,
        author: 1,
        category: 1,
        "metadata.article.imageUrl": 1,
        "metadata.article.views": 1,
        "metadata.article.readingTime": 1,
        "metadata.article.publishedDate": 1,
        "metadata.article.status": 1,
        featured: 1,
        tags: 1,
        deweyDecimal: 1,
        amount: 1,
        "metadata.article.file.url": 1,
        "metadata.article.file.name": 1,
        "metadata.article.file.size": 1,
        "metadata.article.file.type": 1,
        createdAt: 1,
        updatedAt: 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

    const articles = await articlesCursor.toArray();

    // Get total count
    const total = await contentCollection.countDocuments(query);

    console.log(`📊 Admin: Returning ${articles.length} articles out of ${total} total`);

    // Transform articles
    const transformedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      image_url: article.metadata?.article?.imageUrl || null,
      views: article.metadata?.article?.views || 0,
      read_time: article.metadata?.article?.readingTime || 5,
      published_date: article.metadata?.article?.publishedDate || article.createdAt,
      status: article.metadata?.article?.status || "draft",
      featured: article.featured || false,
      tags: article.tags || [],
      dewey_decimal: article.deweyDecimal || null,
      amount: article.amount || 0.0,
      file_url: article.metadata?.article?.file?.url || null,
      file_name: article.metadata?.article?.file?.name || null,
      file_size: article.metadata?.article?.file?.size || null,
      file_type: article.metadata?.article?.file?.type || null,
      created_at: article.createdAt,
      updated_at: article.updatedAt
    }));

    res.json({
      success: true,
      data: {
        articles: transformedArticles,
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

    const contentCollection = await getCollection("content");

    const article = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "article",
      "metadata.article.status": "published"
    });

    if (!article || !article.metadata?.article?.file?.url) {
      return res.status(404).json({
        success: false,
        message: "Article or document not found",
      });
    }

    // Increment download count
    await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { "metadata.article.file.downloadCount": 1 } }
    );

    const fileData = article.metadata.article.file;
    const downloadUrl = `/uploads/articles/files/${fileData.url}`;

    res.json({
      success: true,
      data: {
        download_url: downloadUrl,
        file_name: fileData.name,
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