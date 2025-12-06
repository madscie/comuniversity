// controllers/bookController.js - COMPLETE VERSION WITH PAYMENT RESTRICTIONS
import db from "../config/database.js";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

// Helper function to safely handle values
const safeValue = (value) => {
  if (value === undefined || value === "" || value === "null") return null;
  return value;
};

// Helper function to check book access
const checkBookAccess = async (userId, bookId) => {
  try {
    // First, check if the book exists and is available
    const [book] = await db.execute(
      `SELECT id, price, available_copies, status, title 
       FROM books 
       WHERE id = ? AND status = 'available'`,
      [bookId]
    );
    
    if (book.length === 0) {
      return { 
        hasAccess: false, 
        reason: "Book not found or not available",
        price: 0 
      };
    }
    
    const bookPrice = parseFloat(book[0].price) || 0;
    const availableCopies = book[0].available_copies || 0;
    const bookTitle = book[0].title;
    
    // If book is free AND has available copies, grant access
    if (bookPrice === 0 && availableCopies > 0) {
      return { 
        hasAccess: true, 
        isFree: true, 
        price: 0,
        bookTitle,
        availableCopies 
      };
    }
    
    // Check if there are available copies
    if (availableCopies <= 0) {
      return { 
        hasAccess: false, 
        reason: "No copies available", 
        price: bookPrice,
        bookTitle 
      };
    }
    
    // For paid books, check if user has access
    if (!userId) {
      return { 
        hasAccess: false, 
        reason: "Authentication required", 
        price: bookPrice,
        bookTitle,
        requiresLogin: true 
      };
    }
    
    // Check if user already has access to this book (purchased or borrowed)
    const [access] = await db.execute(
      `SELECT * FROM book_access 
       WHERE user_id = ? AND book_id = ? 
       AND access_granted = TRUE
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId, bookId]
    );
    
    if (access.length > 0) {
      return { 
        hasAccess: true, 
        isFree: false, 
        price: bookPrice,
        bookTitle,
        availableCopies,
        accessData: access[0] 
      };
    }
    
    return { 
      hasAccess: false, 
      reason: "Payment required", 
      price: bookPrice,
      bookTitle,
      availableCopies,
      requiresPayment: true 
    };
  } catch (error) {
    console.error("Error checking book access:", error);
    return { 
      hasAccess: false, 
      reason: "Server error", 
      price: 0 
    };
  }
};

// Get all books with filtering and pagination
export const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      includeAll = false,
      status = "available",
      showFreeOnly = false,
      showPaidOnly = false,
      format,
    } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    console.log("=== BOOKS API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Offset:", offset);
    console.log("Include All:", includeAll, "Status:", status);

    let query = `
      SELECT id, title, author, description, isbn, category, dewey_number, price,
             format, cover_image, file_url, file_size, file_name, file_type,
             pages, publisher, published_date, language, rating, total_ratings, downloads,
             status, total_copies, available_copies, featured, created_at
      FROM books 
      WHERE 1=1
    `;

    let params = [];

    // Only filter by status if not including all books
    if (!includeAll) {
      query += ` AND status = ?`;
      params.push(status);
    }

    // Filter by price if specified
    if (showFreeOnly === "true") {
      query += ` AND price = 0`;
    } else if (showPaidOnly === "true") {
      query += ` AND price > 0`;
    }

    // Filter by format if specified
    if (format && format !== "all") {
      query += ` AND format = ?`;
      params.push(format);
    }

    // Add filters
    if (category && category !== "all") {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    console.log("Final Query:", query);
    console.log("Params:", params);

    const [books] = await db.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM books WHERE 1=1`;
    let countParams = [];

    if (!includeAll) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (showFreeOnly === "true") {
      countQuery += ` AND price = 0`;
    } else if (showPaidOnly === "true") {
      countQuery += ` AND price > 0`;
    }

    if (format && format !== "all") {
      countQuery += ` AND format = ?`;
      countParams.push(format);
    }

    if (category && category !== "all") {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }

    if (search) {
      countQuery += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    console.log(
      `📚 Returning ${books.length} books out of ${total} total`
    );

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
        filters: {
          includeAll,
          status,
          showFreeOnly: showFreeOnly === "true",
          showPaidOnly: showPaidOnly === "true",
          format,
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

// Get single book by ID with access control
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Extract user ID from token if available
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        console.log("Token verification failed:", error.message);
      }
    }

    // Check book access
    const accessCheck = await checkBookAccess(userId, id);
    
    // Get book details
    let bookQuery = `
      SELECT id, title, author, description, isbn, category, dewey_number, price,
             format, cover_image, file_url, file_size, file_name, file_type,
             pages, publisher, published_date, language, rating, total_ratings, downloads,
             status, total_copies, available_copies, featured, created_at
      FROM books WHERE id = ?
    `;
    
    // If not admin, only show available books
    if (!req.user?.role === 'admin') {
      bookQuery += " AND status = 'available'";
    }
    
    const [books] = await db.execute(bookQuery, [id]);

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = books[0];
    
    // Check if user is admin (admin can see everything)
    const isAdmin = req.user?.role === 'admin';
    
    // If user doesn't have access to paid content and is not admin, restrict it
    if (!accessCheck.hasAccess && book.price > 0 && !isAdmin) {
      // Return limited information for paid books without access
      const limitedBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description || "This is a premium book. Purchase to read the full content.",
        category: book.category,
        dewey_number: book.dewey_number,
        price: book.price,
        format: book.format,
        cover_image: book.cover_image,
        pages: book.pages,
        publisher: book.publisher,
        published_date: book.published_date,
        language: book.language,
        rating: book.rating,
        total_ratings: book.total_ratings,
        downloads: book.downloads,
        status: book.status,
        total_copies: book.total_copies,
        available_copies: book.available_copies,
        featured: book.featured,
        // Don't include file_url for restricted books
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_restricted: true,
        has_access: false,
        require_payment: true,
        access_message: accessCheck.requiresLogin 
          ? "Please login to purchase this book" 
          : "Payment required to access this book",
        available_copies_info: `${book.available_copies} of ${book.total_copies} copies available`
      };

      // Increment view count even for restricted books
      await db.execute(
        "UPDATE books SET downloads = downloads + 1 WHERE id = ?",
        [id]
      );

      return res.json({
        success: true,
        data: {
          book: limitedBook,
          access_info: {
            has_access: false,
            message: accessCheck.reason,
            price: book.price,
            available_copies: book.available_copies
          }
        },
      });
    }

    // If user has access (either free, paid with access, or admin)
    // Increment download/view count
    await db.execute(
      "UPDATE books SET downloads = downloads + 1 WHERE id = ?",
      [id]
    );

    // Decrease available copies if user is accessing (for physical books)
    if (book.format === 'physical' || book.format === 'both') {
      if (book.available_copies > 0) {
        await db.execute(
          "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
          [id]
        );
        
        // Record book access/borrow
        if (userId) {
          await db.execute(
            `INSERT INTO book_access 
             (user_id, book_id, access_type, access_granted, expires_at) 
             VALUES (?, ?, 'borrow', TRUE, DATE_ADD(NOW(), INTERVAL 14 DAY))`,
            [userId, id]
          );
        }
      }
    }

    // For users with access, return full book
    const fullBook = {
      ...book,
      is_restricted: false,
      has_access: true,
      require_payment: book.price > 0,
      available_copies_info: `${book.available_copies} of ${book.total_copies} copies available`
    };

    res.json({
      success: true,
      data: {
        book: fullBook,
        access_info: {
          has_access: true,
          is_free: book.price === 0,
          price: book.price,
          available_copies: book.available_copies
        }
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

// Get book file with access control
export const getBookFile = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = null;
    
    // Extract user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please login to download this book.",
        });
      }
    }

    // Check book access
    const accessCheck = await checkBookAccess(userId, id);
    
    if (!accessCheck.hasAccess) {
      return res.status(403).json({
        success: false,
        message: accessCheck.reason || "Payment required to download this book",
        price: accessCheck.price,
        available_copies: accessCheck.availableCopies,
        requires_login: accessCheck.requiresLogin || false,
      });
    }

    const [books] = await db.execute(
      "SELECT file_url, file_name, format FROM books WHERE id = ? AND status = 'available'",
      [id]
    );

    if (books.length === 0 || !books[0].file_url) {
      return res.status(404).json({
        success: false,
        message: "Book or file not found",
      });
    }

    const book = books[0];
    
    // For physical books, we might not have a file
    if (book.format === 'physical' && !book.file_url) {
      return res.status(404).json({
        success: false,
        message: "This is a physical book. No digital file available.",
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'files', book.file_url);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${book.file_name || 'book'}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send the file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error downloading file",
          });
        }
      }
    });
  } catch (error) {
    console.error("❌ Get book file error:", error);
    res.status(500).json({
      success: false,
      message: "Error accessing book file",
    });
  }
};

// Create book
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
    if (!title || !author || !category || !format) {
      return res.status(400).json({
        success: false,
        message: "Title, author, category, and format are required",
      });
    }

    // Validate price
    const bookPrice = parseFloat(price) || 0;
    if (bookPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Validate total copies
    const totalCopies = parseInt(total_copies) || (format === 'digital' ? 999999 : 1);
    const availableCopies = totalCopies;

    // Handle file uploads
    let coverImageUrl = null;
    let bookFileUrl = null;
    let fileSize = null;
    let fileName = null;
    let fileType = null;

    if (req.files?.cover_image?.[0]) {
      const coverFile = req.files.cover_image[0];
      coverImageUrl = coverFile.filename;
      console.log("🖼️ Book cover image saved:", coverImageUrl);
    }

    if (req.files?.book_file?.[0]) {
      const bookFile = req.files.book_file[0];
      bookFileUrl = bookFile.filename;
      fileSize = bookFile.size;
      fileName = bookFile.originalname;
      fileType = bookFile.mimetype;
      console.log("📄 Book file saved:", bookFileUrl);
      console.log("📊 Book file details:", { fileSize, fileName, fileType });
    }

    // For digital books, file is required
    if ((format === 'digital' || format === 'both') && !bookFileUrl) {
      return res.status(400).json({
        success: false,
        message: "Book file is required for digital formats",
      });
    }

    console.log("💾 CREATING BOOK WITH DATA:", {
      title,
      author,
      category,
      price: bookPrice,
      format,
      totalCopies,
      availableCopies,
      coverImageUrl,
      bookFileUrl,
    });

    const [result] = await db.execute(
      `INSERT INTO books (
        title, author, description, isbn, category, dewey_number, price,
        format, cover_image, file_url, file_size, file_name, file_type,
        pages, publisher, published_date, language, status, total_copies,
        available_copies, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeValue(title),
        safeValue(author),
        safeValue(description),
        safeValue(isbn),
        safeValue(category),
        safeValue(dewey_number),
        bookPrice,
        safeValue(format),
        safeValue(coverImageUrl),
        safeValue(bookFileUrl),
        fileSize,
        fileName,
        fileType,
        parseInt(pages) || null,
        safeValue(publisher),
        safeValue(published_date),
        safeValue(language) || 'English',
        safeValue(status) || 'available',
        totalCopies,
        availableCopies,
        featured ? 1 : 0,
      ]
    );

    const [newBook] = await db.execute(
      "SELECT * FROM books WHERE id = ?",
      [result.insertId]
    );

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

    res.status(500).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    });
  }
};

// Update book
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

    // Validate price
    const bookPrice = parseFloat(price) || 0;
    if (bookPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Use existing values if not provided
    const currentBook = existingBook[0];
    const finalTitle = title || currentBook.title;
    const finalAuthor = author || currentBook.author;
    const finalCategory = category || currentBook.category;
    const finalFormat = format || currentBook.format;

    // Calculate available copies if total copies changed
    let totalCopies = parseInt(total_copies) || currentBook.total_copies;
    let availableCopies = currentBook.available_copies;
    
    if (totalCopies !== currentBook.total_copies) {
      const borrowedCopies = currentBook.total_copies - currentBook.available_copies;
      availableCopies = Math.max(0, totalCopies - borrowedCopies);
    }

    // Use existing file URLs unless new files are provided
    let coverImageUrl = currentBook.cover_image;
    let bookFileUrl = currentBook.file_url;
    let fileName = currentBook.file_name;
    let fileType = currentBook.file_type;
    let fileSize = currentBook.file_size;

    // Handle file uploads
    if (req.files && req.files.cover_image && req.files.cover_image[0]) {
      const coverFile = req.files.cover_image[0];
      coverImageUrl = coverFile.filename;
      console.log("🖼️ New book cover uploaded:", coverImageUrl);
    }

    if (req.files && req.files.book_file && req.files.book_file[0]) {
      const bookFile = req.files.book_file[0];
      bookFileUrl = bookFile.filename;
      fileName = bookFile.originalname;
      fileType = bookFile.mimetype;
      fileSize = bookFile.size;
      console.log("📄 New book file uploaded:", bookFileUrl);
    }

    console.log("💾 UPDATING BOOK WITH DATA:", {
      finalTitle,
      finalAuthor,
      finalCategory,
      price: bookPrice,
      format: finalFormat,
      totalCopies,
      availableCopies,
      coverImageUrl,
      bookFileUrl,
    });

    await db.execute(
      `UPDATE books SET 
        title = ?, author = ?, description = ?, isbn = ?, category = ?, 
        dewey_number = ?, price = ?, format = ?, cover_image = ?, 
        file_url = ?, file_name = ?, file_type = ?, file_size = ?,
        pages = ?, publisher = ?, published_date = ?, language = ?, 
        status = ?, total_copies = ?, available_copies = ?, featured = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        safeValue(finalTitle),
        safeValue(finalAuthor),
        safeValue(description),
        safeValue(isbn),
        safeValue(finalCategory),
        safeValue(dewey_number),
        bookPrice,
        safeValue(finalFormat),
        safeValue(coverImageUrl),
        safeValue(bookFileUrl),
        safeValue(fileName),
        safeValue(fileType),
        safeValue(fileSize),
        parseInt(pages) || null,
        safeValue(publisher),
        safeValue(published_date),
        safeValue(language),
        safeValue(status) || 'available',
        totalCopies,
        availableCopies,
        featured ? 1 : 0,
        id,
      ]
    );

    const [updatedBook] = await db.execute(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

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

    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// Update book status
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

    await db.execute(
      `UPDATE books SET 
        status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [status, id]
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

// Delete book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const [existingBooks] = await db.execute(
      "SELECT id, title, file_url, cover_image FROM books WHERE id = ?",
      [id]
    );

    if (existingBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = existingBooks[0];

    // Delete associated files from filesystem
    try {
      if (book.file_url) {
        const filePath = path.join(process.cwd(), 'uploads', 'files', book.file_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("🗑️ Deleted book file:", book.file_url);
        }
      }
      
      if (book.cover_image) {
        const imagePath = path.join(process.cwd(), 'uploads', 'images', book.cover_image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("🗑️ Deleted book cover:", book.cover_image);
        }
      }
    } catch (fileError) {
      console.error("Error deleting book files:", fileError);
      // Continue with DB deletion even if file deletion fails
    }

    // Delete the book from database
    await db.execute("DELETE FROM books WHERE id = ?", [id]);

    // Also delete associated access records
    await db.execute("DELETE FROM book_access WHERE book_id = ?", [id]);

    console.log(`🗑️ Book deleted: ${book.title} (ID: ${id})`);

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
      `SELECT id, title, author, description, category, dewey_number, price,
             format, cover_image, pages, publisher, published_date, language,
             rating, total_ratings, downloads, available_copies, featured
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
      `SELECT id, title, author, description, category, dewey_number, price,
             format, cover_image, pages, publisher, published_date, language,
             rating, total_ratings, downloads, available_copies, featured
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
      `SELECT id, title, author, description, category, dewey_number, price,
             format, cover_image, pages, publisher, published_date, language,
             rating, total_ratings, downloads, available_copies, featured
       FROM books 
       WHERE (title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?) 
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
        `%${query}%`,
        parseInt(limit),
        offset,
      ]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM books 
       WHERE (title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?) 
       AND status = 'available'`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
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

// Get all books for admin (including unavailable)
export const getAdminBooks = async (req, res) => {
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

    console.log("=== ADMIN BOOKS API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Offset:", offset);
    console.log("Status:", status);

    let query = `
      SELECT id, title, author, description, isbn, category, dewey_number, price,
             format, cover_image, file_url, file_size, file_name, file_type,
             pages, publisher, published_date, language, rating, total_ratings, downloads,
             status, total_copies, available_copies, featured, created_at
      FROM books 
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
      query += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    console.log("Final Admin Query:", query);
    console.log("Admin Params:", params);

    const [books] = await db.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM books WHERE 1=1`;
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
      countQuery += ` AND (title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    console.log(
      `📚 Admin: Returning ${books.length} books out of ${total} total`
    );

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
    console.error("❌ Admin: Get books error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching books: " + error.message,
    });
  }
};

// Download book (legacy endpoint)
export const downloadBook = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await db.execute(
      "SELECT file_url, file_name FROM books WHERE id = ? AND status = 'available'",
      [id]
    );

    if (books.length === 0 || !books[0].file_url) {
      return res.status(404).json({
        success: false,
        message: "Book or file not found",
      });
    }

    const book = books[0];
    
    // Construct the full URL for download
    const downloadUrl = `/uploads/files/${book.file_url}`;

    res.json({
      success: true,
      data: {
        download_url: downloadUrl,
        file_name: book.file_name,
      },
    });
  } catch (error) {
    console.error("❌ Download book error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading book",
    });
  }
};

// ================== PAYMENT & ACCESS CONTROL FUNCTIONS ==================

// Create book payment record
export const createBookPayment = async (req, res) => {
  try {
    const { book_id, amount, transaction_id, payment_method = "manual" } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user.userId;

    // Verify book exists and is available
    const [books] = await db.execute(
      "SELECT id, price, title, format FROM books WHERE id = ? AND status = 'available'",
      [book_id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found or not available",
      });
    }

    const book = books[0];
    const bookPrice = parseFloat(book.price) || 0;
    
    // If book is free, no payment needed
    if (bookPrice === 0) {
      return res.status(400).json({
        success: false,
        message: "This book is already free",
      });
    }
    
    // Verify payment amount matches book price
    if (parseFloat(amount) !== bookPrice) {
      return res.status(400).json({
        success: false,
        message: `Payment amount ($${amount}) doesn't match book price ($${bookPrice})`,
      });
    }

    // Check if user already has access
    const [existingAccess] = await db.execute(
      `SELECT * FROM book_access 
       WHERE user_id = ? AND book_id = ? 
       AND access_granted = TRUE
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId, book_id]
    );

    if (existingAccess.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have access to this book",
      });
    }

    // Create payment record (you might want a separate book_payments table)
    const [result] = await db.execute(
      `INSERT INTO user_payments 
       (user_id, book_id, amount, transaction_id, status, payment_method, type) 
       VALUES (?, ?, ?, ?, 'completed', ?, 'book')`,
      [userId, book_id, amount, transaction_id, payment_method]
    );

    // Grant access to book
    await db.execute(
      `INSERT INTO book_access 
       (user_id, book_id, access_type, access_granted, payment_id) 
       VALUES (?, ?, 'purchase', TRUE, ?)`,
      [userId, book_id, result.insertId]
    );

    // Log the purchase
    console.log(`💰 Book payment completed: User ${userId} purchased book ${book_id} for $${amount}`);

    res.json({
      success: true,
      message: "Payment completed and access granted",
      data: {
        payment_id: result.insertId,
        book_id,
        book_title: book.title,
        amount_paid: amount,
        access_granted: true,
        access_type: 'purchase',
        access_timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Create book payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payment: " + error.message,
    });
  }
};

// Borrow physical book
export const borrowBook = async (req, res) => {
  try {
    const { book_id } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user.userId;

    // Verify book exists and is available
    const [books] = await db.execute(
      "SELECT id, title, available_copies, format FROM books WHERE id = ? AND status = 'available'",
      [book_id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found or not available",
      });
    }

    const book = books[0];
    
    // Check if book is physical
    if (book.format !== 'physical' && book.format !== 'both') {
      return res.status(400).json({
        success: false,
        message: "This book is not available for borrowing",
      });
    }
    
    // Check if copies are available
    if (book.available_copies <= 0) {
      return res.status(400).json({
        success: false,
        message: "No copies available for borrowing",
      });
    }

    // Check if user already has this book borrowed
    const [existingBorrow] = await db.execute(
      `SELECT * FROM book_access 
       WHERE user_id = ? AND book_id = ? 
       AND access_type = 'borrow' 
       AND access_granted = TRUE
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId, book_id]
    );

    if (existingBorrow.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have this book borrowed",
      });
    }

    // Reduce available copies
    await db.execute(
      "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
      [book_id]
    );

    // Create borrow record (14 days borrowing period)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await db.execute(
      `INSERT INTO book_access 
       (user_id, book_id, access_type, access_granted, expires_at) 
       VALUES (?, ?, 'borrow', TRUE, ?)`,
      [userId, book_id, expiresAt]
    );

    console.log(`📚 Book borrowed: User ${userId} borrowed book ${book_id}`);

    res.json({
      success: true,
      message: "Book borrowed successfully",
      data: {
        book_id,
        book_title: book.title,
        borrowed_date: new Date().toISOString(),
        due_date: expiresAt.toISOString(),
        access_granted: true,
        access_type: 'borrow'
      }
    });
  } catch (error) {
    console.error("❌ Borrow book error:", error);
    res.status(500).json({
      success: false,
      message: "Error borrowing book: " + error.message,
    });
  }
};

// Return borrowed book
export const returnBook = async (req, res) => {
  try {
    const { access_id } = req.params;
    
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user.userId;

    // Check if access record exists and belongs to user
    const [accessRecords] = await db.execute(
      `SELECT ba.*, b.title as book_title, b.id as book_id
       FROM book_access ba
       JOIN books b ON ba.book_id = b.id
       WHERE ba.id = ? AND ba.user_id = ? 
       AND ba.access_type = 'borrow' 
       AND ba.access_granted = TRUE`,
      [access_id, userId]
    );

    if (accessRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found",
      });
    }

    const access = accessRecords[0];

    // Mark access as returned
    await db.execute(
      "UPDATE book_access SET access_granted = FALSE, returned_at = NOW() WHERE id = ?",
      [access_id]
    );

    // Increase available copies
    await db.execute(
      "UPDATE books SET available_copies = available_copies + 1 WHERE id = ?",
      [access.book_id]
    );

    console.log(`📚 Book returned: User ${userId} returned book ${access.book_id}`);

    res.json({
      success: true,
      message: "Book returned successfully",
      data: {
        book_id: access.book_id,
        book_title: access.book_title,
        returned_date: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Return book error:", error);
    res.status(500).json({
      success: false,
      message: "Error returning book: " + error.message,
    });
  }
};

// Get user's borrowed books
export const getUserBorrowedBooks = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [books] = await db.execute(
      `SELECT b.*, ba.access_date, ba.expires_at, ba.returned_at
       FROM books b
       JOIN book_access ba ON b.id = ba.book_id
       WHERE ba.user_id = ? AND ba.access_type = 'borrow'
       AND ba.access_granted = TRUE
       ORDER BY ba.expires_at ASC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total
       FROM book_access ba
       WHERE ba.user_id = ? AND ba.access_type = 'borrow'
       AND ba.access_granted = TRUE`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error("❌ Get borrowed books error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching borrowed books: " + error.message,
    });
  }
};

// Get user's purchased books
export const getUserPurchasedBooks = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [books] = await db.execute(
      `SELECT b.*, up.payment_date, up.amount as paid_amount, up.transaction_id
       FROM books b
       JOIN book_access ba ON b.id = ba.book_id
       JOIN user_payments up ON ba.payment_id = up.id
       WHERE ba.user_id = ? AND ba.access_type = 'purchase'
       AND ba.access_granted = TRUE
       AND up.status = 'completed'
       AND b.status = 'available'
       ORDER BY up.payment_date DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total
       FROM book_access ba
       JOIN user_payments up ON ba.payment_id = up.id
       WHERE ba.user_id = ? AND ba.access_type = 'purchase'
       AND ba.access_granted = TRUE
       AND up.status = 'completed'`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        },
        summary: {
          total_purchased: countResult[0].total,
          total_spent: books.reduce((sum, book) => sum + parseFloat(book.paid_amount || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error("❌ Get purchased books error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching purchased books: " + error.message,
    });
  }
};

// Check if user can access specific book
export const checkBookAccessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = null;
    
    if (req.user && req.user.userId) {
      userId = req.user.userId;
    }

    const accessCheck = await checkBookAccess(userId, id);
    
    // Get book details
    const [books] = await db.execute(
      "SELECT id, title, price, author, category, format, available_copies FROM books WHERE id = ? AND status = 'available'",
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = books[0];

    res.json({
      success: true,
      data: {
        book_id: id,
        book_title: book.title,
        book_price: book.price,
        book_format: book.format,
        has_access: accessCheck.hasAccess,
        is_free: parseFloat(book.price) === 0,
        requires_payment: parseFloat(book.price) > 0 && !accessCheck.hasAccess,
        requires_login: accessCheck.requiresLogin || false,
        available_copies: book.available_copies,
        access_message: accessCheck.reason,
        user_authenticated: !!userId
      }
    });
  } catch (error) {
    console.error("❌ Check book access status error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking book access status: " + error.message,
    });
  }
};