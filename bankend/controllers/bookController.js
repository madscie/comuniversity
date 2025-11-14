import db from "../config/database.js";
import { cloudinary, testCloudinaryConnection } from "../config/cloudinary.js";

// Helper function for building queries
const buildBooksQuery = (filters = {}) => {
  let query = `
    SELECT id, title, author, description, isbn, category, dewey_number, price, 
           format, cover_image, file_url, file_size, pages, publisher, 
           published_date, language, rating, total_ratings, downloads, 
           status, total_copies, available_copies, featured, created_at
    FROM books 
    WHERE status = 'available'
  `;
  const params = [];

  const { category, search, minPrice, maxPrice } = filters;

  if (category && category !== "all") {
    query += ` AND category = ?`;
    params.push(category);
  }

  if (search) {
    query += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (minPrice) {
    query += ` AND price >= ?`;
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    query += ` AND price <= ?`;
    params.push(parseFloat(maxPrice));
  }

  return { query, params };
};

// Get all books with filtering and pagination
// Alternative getBooks function if the above still fails
export const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    console.log("=== BOOKS API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Offset:", offset);

    let query = `
      SELECT id, title, author, description, isbn, category, dewey_number, price, 
             format, cover_image, file_url, file_size, pages, publisher, 
             published_date, language, rating, total_ratings, downloads, 
             status, total_copies, available_copies, featured, created_at
      FROM books 
      WHERE status = 'available'
    `;

    let params = [];

    // Add filters
    if (category && category !== "all") {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ` AND price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ` AND price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Add pagination - FIX: Use template literals instead of prepared statements for LIMIT/OFFSET
    query += ` ORDER BY featured DESC, created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    console.log("Final Query:", query);
    console.log("Params:", params);

    const [books] = await db.execute(query, params);

    // Get total count (similar logic without LIMIT/OFFSET)
    let countQuery = `SELECT COUNT(*) as total FROM books WHERE status = 'available'`;
    let countParams = [];

    if (category && category !== "all") {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }

    if (search) {
      countQuery += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      countQuery += ` AND price >= ?`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countQuery += ` AND price <= ?`;
      countParams.push(parseFloat(maxPrice));
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get books error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching books: " + error.message,
    });
  }
};

// Get single book by ID
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await db.execute(
      `SELECT * FROM books WHERE id = ? AND status = 'available'`,
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      data: {
        book: books[0],
      },
    });
  } catch (error) {
    console.error("❌ Get book error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching book",
    });
  }
};

// controllers/bookController.js

// Test Cloudinary on startup
testCloudinaryConnection();

// Improved upload function with better error handling
const uploadToCloudinary = async (file, folder = "books") => {
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
// controllers/bookController.js - FIXED createBook function
export const createBook = async (req, res) => {
  try {
    console.log("📥 CREATE BOOK REQUEST BODY:", req.body);
    console.log("📁 FILES RECEIVED:", req.files);

    const {
      title,
      author,
      description,
      isbn,
      category,
      dewey_number,
      price,
      format,
      pages,
      publisher,
      published_date,
      language,
      status,
      total_copies,
      featured,
    } = req.body;

    // Validate required fields
    if (!title || !author || !category || !dewey_number) {
      return res.status(400).json({
        success: false,
        message: "Title, author, category, and dewey number are required",
      });
    }

    // Handle file uploads
    let coverImageUrl = null;
    let bookFileUrl = null;

    if (req.files?.cover_image?.[0]) {
      const coverFile = req.files.cover_image[0];
      coverImageUrl = coverFile.filename;
      console.log("🖼️ Cover image path:", coverImageUrl);
    }

    if (req.files?.book_file?.[0]) {
      const bookFile = req.files.book_file[0];
      bookFileUrl = bookFile.filename;
      console.log("📄 Book file path:", bookFileUrl);
    }

    // Calculate available copies
    const available_copies =
      status === "available" ? parseInt(total_copies) : 0;

    console.log("💾 CREATING BOOK WITH DATA:", {
      title,
      author,
      category,
      dewey_number,
      coverImageUrl,
      bookFileUrl,
      available_copies,
    });

    // FIXED: Use the correct column name (cover_image instead of cover_images)
    const [result] = await db.execute(
      `INSERT INTO books (
        title, author, description, isbn, category, dewey_number, price, 
        format, cover_image, file_url, pages, publisher, published_date, 
        language, status, total_copies, available_copies, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeValue(title),
        safeValue(author),
        safeValue(description),
        safeValue(isbn),
        safeValue(category),
        safeValue(dewey_number),
        parseFloat(price) || 0.0,
        safeValue(format) || "physical",
        safeValue(coverImageUrl),
        safeValue(bookFileUrl),
        safeNumber(pages),
        safeValue(publisher),
        safeValue(published_date),
        safeValue(language) || "English",
        safeValue(status) || "available",
        parseInt(total_copies) || 1,
        available_copies,
        featured ? 1 : 0,
      ]
    );

    const [newBook] = await db.execute("SELECT * FROM books WHERE id = ?", [
      result.insertId,
    ]);

    console.log("✅ BOOK CREATED SUCCESSFULLY, ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: {
        book: newBook[0],
      },
    });
  } catch (error) {
    console.error("❌ CREATE BOOK ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    });
  }
};
// controllers/bookController.js - SIMPLIFIED AND WORKING VERSION

// Helper function to safely handle values
const safeValue = (value) => {
  if (value === undefined || value === "") return null;
  return value;
};

const safeNumber = (value) => {
  if (value === undefined || value === "") return null;
  return parseInt(value);
};

// controllers/bookController.js - FIXED updateBookStatus

export const updateBookStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("🔄 Updating book status:", { id, status });

    // Check if book exists
    const [existingBook] = await db.execute(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Calculate available copies based on status
    const available_copies =
      status === "available" ? existingBook[0].total_copies : 0;

    console.log("📊 Setting available copies to:", available_copies);

    await db.execute(
      `UPDATE books SET 
        status = ?, available_copies = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [status, available_copies, id]
    );

    console.log("✅ BOOK STATUS UPDATED SUCCESSFULLY, ID:", id);

    res.json({
      success: true,
      message: "Book status updated successfully",
    });
  } catch (error) {
    console.error("❌ UPDATE BOOK STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book status",
      error: error.message,
    });
  }
};

// controllers/bookController.js - FIXED updateBook function
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📥 UPDATE BOOK REQUEST:", {
      id,
      body: req.body,
      files: req.files,
    });

    // Check if book exists
    const [existingBook] = await db.execute(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const {
      title,
      author,
      description,
      isbn,
      category,
      dewey_number,
      price,
      format,
      pages,
      publisher,
      published_date,
      language,
      status,
      total_copies,
      featured,
    } = req.body;

    // Use existing values if not provided
    const currentBook = existingBook[0];
    const finalTitle = title || currentBook.title;
    const finalAuthor = author || currentBook.author;
    const finalCategory = category || currentBook.category;
    const finalDeweyNumber = dewey_number || currentBook.dewey_number;

    // Use existing file URLs unless new files are provided
    let coverImageUrl = currentBook.cover_image;
    let bookFileUrl = currentBook.file_url;

    // Handle file uploads - FIXED: Check for files properly
    if (req.files && req.files.cover_image && req.files.cover_image[0]) {
      const coverFile = req.files.cover_image[0];
      coverImageUrl = coverFile.filename;
      console.log("🖼️ New cover image uploaded:", coverImageUrl);
    }

    if (req.files && req.files.book_file && req.files.book_file[0]) {
      const bookFile = req.files.book_file[0];
      bookFileUrl = bookFile.filename;
      console.log("📄 New book file uploaded:", bookFileUrl);
    }

    // Calculate available copies
    const available_copies =
      status === "available" ? parseInt(total_copies || 1) : 0;

    console.log("💾 UPDATING BOOK WITH DATA:", {
      finalTitle,
      finalAuthor,
      finalCategory,
      finalDeweyNumber,
      coverImageUrl,
      bookFileUrl,
      available_copies,
    });

    // FIXED: Use the correct column name (cover_image instead of cover_images)
    await db.execute(
      `UPDATE books SET 
        title = ?, author = ?, description = ?, isbn = ?, category = ?, 
        dewey_number = ?, price = ?, format = ?, cover_image = ?, 
        file_url = ?, pages = ?, publisher = ?, published_date = ?, 
        language = ?, status = ?, total_copies = ?, available_copies = ?, 
        featured = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [
        safeValue(finalTitle),
        safeValue(finalAuthor),
        safeValue(description),
        safeValue(isbn),
        safeValue(finalCategory),
        safeValue(finalDeweyNumber),
        parseFloat(price || 0),
        safeValue(format) || "physical",
        safeValue(coverImageUrl),
        safeValue(bookFileUrl),
        safeNumber(pages),
        safeValue(publisher),
        safeValue(published_date),
        safeValue(language) || "English",
        safeValue(status) || "available",
        parseInt(total_copies || 1),
        available_copies,
        featured ? 1 : 0,
        id,
      ]
    );

    const [updatedBook] = await db.execute("SELECT * FROM books WHERE id = ?", [
      id,
    ]);

    console.log("✅ BOOK UPDATED SUCCESSFULLY, ID:", id);

    res.json({
      success: true,
      message: "Book updated successfully",
      data: {
        book: updatedBook[0],
      },
    });
  } catch (error) {
    console.error("❌ UPDATE BOOK ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};
// Delete book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const [existingBooks] = await db.execute(
      "SELECT id, title FROM books WHERE id = ?",
      [id]
    );

    if (existingBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const bookTitle = existingBooks[0].title;

    // Delete the book
    await db.execute("DELETE FROM books WHERE id = ?", [id]);

    console.log(`🗑️ Book deleted: ${bookTitle} (ID: ${id})`);

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete book error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting book: " + error.message,
    });
  }
};

// Get featured books
export const getFeaturedBooks = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const [books] = await db.execute(
      `SELECT id, title, author, description, category, price, cover_image, rating
       FROM books 
       WHERE featured = TRUE AND status = 'available'
       ORDER BY created_at DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: {
        books,
      },
    });
  } catch (error) {
    console.error("❌ Get featured books error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured books",
    });
  }
};

// Get books by category
export const getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const [books] = await db.execute(
      `SELECT id, title, author, description, category, price, cover_image, rating
       FROM books 
       WHERE category = ? AND status = 'available'
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [category, parseInt(limit), offset]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM books WHERE category = ? AND status = 'available'`,
      [category]
    );

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get books by category error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching books by category",
    });
  }
};

// Search books
export const searchBooks = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const [books] = await db.execute(
      `SELECT id, title, author, description, category, price, cover_image, rating
       FROM books 
       WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?) 
       AND status = 'available'
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
      `SELECT COUNT(*) as total FROM books 
       WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?) 
       AND status = 'available'`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    res.json({
      success: true,
      data: {
        books,
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
    console.error("❌ Search books error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching books",
    });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      `SELECT category, COUNT(*) as book_count 
       FROM books 
       WHERE status = 'available'
       GROUP BY category 
       ORDER BY book_count DESC`
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
