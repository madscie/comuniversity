import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { getCollection } from "../config/database.js";
import { ObjectId } from "mongodb";

// Helper function to safely handle values
const safeValue = (value) => {
  if (value === undefined || value === "" || value === "null") return null;
  return value;
};

// Helper function to check book access (UPDATED FOR MONGODB)
const checkBookAccess = async (userId, bookId) => {
  try {
    const booksCollection = await getCollection("books");
    
    // First, check if the book exists and is available
    const book = await booksCollection.findOne({
      _id: new ObjectId(bookId),
      "availability.status": "available"
    });
    
    if (!book) {
      return { 
        hasAccess: false, 
        reason: "Book not found or not available",
        price: 0 
      };
    }
    
    const bookPrice = book.price || 0;
    const availableCopies = book.availability?.availableCopies || 0;
    const bookTitle = book.title;
    
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
    
    const transactionsCollection = await getCollection("transactions");
    
    // Check if user already has access to this book (purchased or borrowed)
    const access = await transactionsCollection.findOne({
      "user.userId": new ObjectId(userId),
      "book.bookId": new ObjectId(bookId),
      status: { $in: ["active", "completed"] },
      type: { $in: ["purchase", "borrow"] },
      $or: [
        { "dates.expiresAt": { $gt: new Date() } },
        { "dates.expiresAt": null }
      ]
    });
    
    if (access) {
      return { 
        hasAccess: true, 
        isFree: false, 
        price: bookPrice,
        bookTitle,
        availableCopies,
        accessData: access 
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

// FIXED: Helper function to get correct file URLs - now returns clean paths
const getFileUrl = (filename, type = 'file') => {
  if (!filename) return null;
  
  // Remove any leading slashes and check if it already contains uploads path
  const cleanFilename = filename.replace(/^\//, '');
  
  // If filename already contains full path, extract just the filename
  let finalFilename = cleanFilename;
  if (cleanFilename.includes('uploads/')) {
    // Extract just the filename from the full path
    finalFilename = cleanFilename.split('/').pop();
  }
  
  if (type === 'image') {
    return `/uploads/books/images/${finalFilename}`;
  } else if (type === 'file') {
    return `/uploads/books/files/${finalFilename}`;
  }
  return `/uploads/${finalFilename}`;
};

// Helper function to check if file exists
const checkFileExists = (filename, type = 'file') => {
  if (!filename) return false;
  
  // Extract just the filename if full path is provided
  let finalFilename = filename;
  if (filename.includes('uploads/')) {
    finalFilename = filename.split('/').pop();
  }
  
  let filePath;
  if (type === 'image') {
    filePath = path.join(process.cwd(), 'uploads', 'books', 'images', finalFilename);
  } else if (type === 'file') {
    filePath = path.join(process.cwd(), 'uploads', 'books', 'files', finalFilename);
  } else {
    filePath = path.join(process.cwd(), 'uploads', finalFilename);
  }
  
  return fs.existsSync(filePath);
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
    const skip = (pageNum - 1) * limitNum;

    console.log("=== BOOKS API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Skip:", skip);
    console.log("Include All:", includeAll, "Status:", status);

    const booksCollection = await getCollection("books");

    // Build MongoDB query
    const query = {};
    
    // Only filter by status if not including all books
    if (!includeAll) {
      query["availability.status"] = status;
    }

    // Filter by price if specified
    if (showFreeOnly === "true") {
      query.price = 0;
    } else if (showPaidOnly === "true") {
      query.price = { $gt: 0 };
    }

    // Filter by format if specified
    if (format && format !== "all") {
      query.format = format;
    }

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    console.log("MongoDB Query:", JSON.stringify(query, null, 2));

    // Get books with pagination
    const booksCursor = booksCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        authors: 1,
        description: 1,
        isbn: 1,
        category: 1,
        deweyDecimal: 1,
        deweyHierarchy: 1,
        price: 1,
        format: 1,
        "publication.year": 1,
        "publication.publisher": 1,
        "publication.pages": 1,
        "publication.language": 1,
        coverImage: 1,
        "copies.file.url": 1,
        "copies.file.size": 1,
        "copies.file.name": 1,
        "copies.file.type": 1,
        availability: 1,
        statistics: 1,
        featured: 1,
        createdAt: 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

    const books = await booksCursor.toArray();

    // Get total count
    const total = await booksCollection.countDocuments(query);

    console.log(`📚 Returning ${books.length} books out of ${total} total`);

    // Transform books to match expected format
    const transformedBooks = books.map(book => {
      const fileData = book.copies?.find(c => c.file?.url)?.file;
      return {
        id: book._id,
        title: book.title,
        author: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
        description: book.description,
        isbn: book.isbn,
        category: book.category,
        dewey_number: book.deweyDecimal,
        dewey_hierarchy: book.deweyHierarchy,
        price: book.price || 0,
        format: book.format || "digital",
        cover_image: getFileUrl(book.coverImage, 'image'),
        file_url: fileData ? getFileUrl(fileData.url, 'file') : null,
        file_size: fileData?.size || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
        pages: book.publication?.pages || null,
        publisher: book.publication?.publisher || null,
        published_date: book.publication?.year ? new Date(book.publication.year, 0, 1).toISOString().split('T')[0] : null,
        language: book.publication?.language || "English",
        rating: book.statistics?.averageRating || 0,
        total_ratings: book.statistics?.reviewCount || 0,
        downloads: book.statistics?.totalDownloads || 0,
        status: book.availability?.status || "available",
        total_copies: book.availability?.totalCopies || 0,
        available_copies: book.availability?.availableCopies || 0,
        featured: book.featured || false,
        created_at: book.createdAt
      };
    });

    res.json({
      success: true,
      data: {
        books: transformedBooks,
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        userId = decoded.userId;
      } catch (error) {
        console.log("Token verification failed:", error.message);
      }
    }

    // Check book access
    const accessCheck = await checkBookAccess(userId, id);
    
    const booksCollection = await getCollection("books");
    
    // Get book details
    const book = await booksCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    
    // Check if user is admin (admin can see everything)
    const isAdmin = req.user?.role === 'admin';
    
    // Check if book is available (for non-admin users)
    if (!isAdmin && book.availability?.status !== 'available') {
      return res.status(404).json({
        success: false,
        message: "Book not available",
      });
    }

    const bookPrice = book.price || 0;
    const fileData = book.copies?.find(c => c.file?.url)?.file;
    
    // If user doesn't have access to paid content and is not admin, restrict it
    if (!accessCheck.hasAccess && bookPrice > 0 && !isAdmin) {
      // Return limited information for paid books without access
      const limitedBook = {
        id: book._id,
        title: book.title,
        author: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
        description: book.description || "This is a premium book. Purchase to read the full content.",
        category: book.category,
        dewey_number: book.deweyDecimal,
        dewey_hierarchy: book.deweyHierarchy,
        price: bookPrice,
        format: book.format || "digital",
        cover_image: getFileUrl(book.coverImage, 'image'),
        pages: book.publication?.pages || null,
        publisher: book.publication?.publisher || null,
        published_date: book.publication?.year ? new Date(book.publication.year, 0, 1).toISOString().split('T')[0] : null,
        language: book.publication?.language || "English",
        rating: book.statistics?.averageRating || 0,
        total_ratings: book.statistics?.reviewCount || 0,
        downloads: book.statistics?.totalDownloads || 0,
        status: book.availability?.status || "available",
        total_copies: book.availability?.totalCopies || 0,
        available_copies: book.availability?.availableCopies || 0,
        featured: book.featured || false,
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
        available_copies_info: `${book.availability?.availableCopies || 0} of ${book.availability?.totalCopies || 0} copies available`
      };

      // Increment view count even for restricted books
      await booksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { "statistics.viewCount": 1 } }
      );

      return res.json({
        success: true,
        data: {
          book: limitedBook,
          access_info: {
            has_access: false,
            message: accessCheck.reason,
            price: bookPrice,
            available_copies: book.availability?.availableCopies || 0
          }
        },
      });
    }

    // If user has access (either free, paid with access, or admin)
    // Increment view count
    await booksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { "statistics.viewCount": 1 } }
    );

    // Decrease available copies if user is accessing (for physical books)
    if ((book.format === 'physical' || book.format === 'both') && book.availability?.availableCopies > 0) {
      // Update availability counts
      await booksCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { 
            "availability.availableCopies": -1,
            "availability.loanedCopies": 1
          }
        }
      );
      
      // Record book access/borrow if user is logged in
      if (userId) {
        const transactionsCollection = await getCollection("transactions");
        
        // Calculate expiry date (14 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);
        
        const transaction = {
          transactionId: `TRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "borrow",
          status: "active",
          user: {
            userId: new ObjectId(userId),
            name: req.user?.name || "Unknown",
            email: req.user?.email || "unknown@email.com"
          },
          book: {
            bookId: new ObjectId(id),
            title: book.title,
            authors: book.authors,
            isbn: book.isbn,
            deweyDecimal: book.deweyDecimal
          },
          copy: {
            copyId: book.copies?.find(c => c.type === 'physical' && c.status === 'available')?.copyId || "PHYS-001"
          },
          dates: {
            borrowDate: new Date(),
            dueDate: expiresAt,
            expectedReturnDate: expiresAt
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await transactionsCollection.insertOne(transaction);
      }
    }

    // For users with access, return full book
    const fullBook = {
      id: book._id,
      title: book.title,
      author: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
      description: book.description,
      isbn: book.isbn,
      category: book.category,
      dewey_number: book.deweyDecimal,
      dewey_hierarchy: book.deweyHierarchy,
      price: bookPrice,
      format: book.format || "digital",
      cover_image: getFileUrl(book.coverImage, 'image'),
      file_url: fileData ? getFileUrl(fileData.url, 'file') : null,
      file_size: fileData?.size || null,
      file_name: fileData?.name || null,
      file_type: fileData?.type || null,
      pages: book.publication?.pages || null,
      publisher: book.publication?.publisher || null,
      published_date: book.publication?.year ? new Date(book.publication.year, 0, 1).toISOString().split('T')[0] : null,
      language: book.publication?.language || "English",
      rating: book.statistics?.averageRating || 0,
      total_ratings: book.statistics?.reviewCount || 0,
      downloads: book.statistics?.totalDownloads || 0,
      status: book.availability?.status || "available",
      total_copies: book.availability?.totalCopies || 0,
      available_copies: book.availability?.availableCopies || 0,
      featured: book.featured || false,
      is_restricted: false,
      has_access: true,
      require_payment: bookPrice > 0,
      available_copies_info: `${book.availability?.availableCopies || 0} of ${book.availability?.totalCopies || 0} copies available`,
      copies: book.copies || [],
      publication: book.publication || {}
    };

    res.json({
      success: true,
      data: {
        book: fullBook,
        access_info: {
          has_access: true,
          is_free: bookPrice === 0,
          price: bookPrice,
          available_copies: book.availability?.availableCopies || 0
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
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

    const booksCollection = await getCollection("books");
    
    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book or file not found",
      });
    }
    
    // Find digital copy with file
    const digitalCopy = book.copies?.find(copy => 
      copy.type === 'digital' && copy.file?.url
    );
    
    if (!digitalCopy) {
      return res.status(404).json({
        success: false,
        message: "This book doesn't have a digital file available.",
      });
    }

    // Extract just the filename from the stored URL
    let filename = digitalCopy.file.url;
    if (filename.includes('uploads/')) {
      filename = filename.split('/').pop();
    }

    const filePath = path.join(process.cwd(), 'uploads', 'books', 'files', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Try alternative path for backward compatibility
      const altPath = path.join(process.cwd(), 'uploads', 'files', filename);
      if (fs.existsSync(altPath)) {
        console.log(`📁 File found at alternative path: ${altPath}`);
      } else {
        console.log(`❌ File not found: ${filePath}`);
        console.log(`❌ Alternative path also not found: ${altPath}`);
        return res.status(404).json({
          success: false,
          message: "File not found on server",
          debug: {
            requested_path: filePath,
            alt_path: altPath,
            filename: filename,
            stored_url: digitalCopy.file.url
          }
        });
      }
    }

    // Increment download count
    await booksCollection.updateOne(
      { _id: new ObjectId(id), "copies.copyId": digitalCopy.copyId },
      { $inc: { "copies.$.file.downloadCount": 1, "statistics.totalDownloads": 1 } }
    );

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${digitalCopy.file.name || 'book'}"`);
    res.setHeader('Content-Type', digitalCopy.file.type || 'application/octet-stream');
    
    // Send the file
    const finalPath = fs.existsSync(filePath) ? filePath : path.join(process.cwd(), 'uploads', 'files', filename);
    res.sendFile(finalPath, (err) => {
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

// Get book file via direct URL
export const getBookFileDirect = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename is required",
      });
    }
    
    // Check for security - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: "Invalid filename",
      });
    }
    
    // Try books/files directory first
    let filePath = path.join(process.cwd(), 'uploads', 'books', 'files', filename);
    
    if (!fs.existsSync(filePath)) {
      // Try alternative location for backward compatibility
      filePath = path.join(process.cwd(), 'uploads', 'files', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error("❌ Get book file direct error:", error);
    res.status(500).json({
      success: false,
      message: "Error accessing file",
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
    let bookFileData = null;

    if (req.files?.cover_image?.[0]) {
      const coverFile = req.files.cover_image[0];
      coverImageUrl = coverFile.filename;
      console.log("🖼️ Book cover image saved:", coverImageUrl);
    }

    if (req.files?.book_file?.[0]) {
      const bookFile = req.files.book_file[0];
      bookFileData = {
        url: bookFile.filename,
        name: bookFile.originalname,
        type: bookFile.mimetype,
        size: bookFile.size,
        downloadCount: 0
      };
      console.log("📄 Book file saved:", bookFileData.url);
    }

    // For digital books, file is required
    if ((format === 'digital' || format === 'both') && !bookFileData) {
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
      bookFileUrl: bookFileData?.url,
    });

    const booksCollection = await getCollection("books");

    // Parse authors (could be comma-separated string or array)
    const authors = Array.isArray(author) ? author : 
                   typeof author === 'string' && author.includes(',') ? 
                   author.split(',').map(a => a.trim()) : [author];

    // Parse Dewey hierarchy from dewey_number
    const deweyHierarchy = [];
    if (dewey_number) {
      const parts = dewey_number.split('.');
      let current = "";
      for (let i = 0; i < parts.length; i++) {
        current = i === 0 ? parts[i] : `${current}.${parts[i]}`;
        deweyHierarchy.push(current);
      }
    }

    // Build copies array based on format
    const copies = [];
    
    // Add digital copy if format includes digital
    if ((format === 'digital' || format === 'both') && bookFileData) {
      copies.push({
        copyId: `DIG-${Date.now().toString().slice(-6)}`,
        type: "digital",
        status: "available",
        file: bookFileData
      });
    }
    
    // Add physical copies if format includes physical
    if (format === 'physical' || format === 'both') {
      const physicalCopiesCount = format === 'both' ? Math.max(1, Math.floor(totalCopies / 2)) : totalCopies;
      for (let i = 1; i <= physicalCopiesCount; i++) {
        copies.push({
          copyId: `PHYS-${i.toString().padStart(3, '0')}`,
          type: "physical",
          status: "available",
          location: {
            library: "Main Library",
            section: category || "General",
            shelf: `Shelf ${Math.floor(Math.random() * 100) + 1}`
          }
        });
      }
    }

    // Create book document
    const bookDocument = {
      bookId: `BK-${Date.now().toString().slice(-6)}`,
      title: safeValue(title),
      authors: authors,
      description: safeValue(description),
      isbn: safeValue(isbn),
      category: safeValue(category),
      deweyDecimal: safeValue(dewey_number),
      deweyHierarchy: deweyHierarchy,
      price: bookPrice,
      format: safeValue(format),
      coverImage: safeValue(coverImageUrl),
      publication: {
        year: published_date ? parseInt(published_date.split('-')[0]) : null,
        publisher: safeValue(publisher),
        pages: parseInt(pages) || null,
        language: safeValue(language) || "English",
        edition: "1st"
      },
      copies: copies,
      availability: {
        totalCopies: totalCopies,
        availableCopies: availableCopies,
        physicalCopies: copies.filter(c => c.type === 'physical').length,
        digitalCopies: copies.filter(c => c.type === 'digital').length,
        status: safeValue(status) || "available"
      },
      statistics: {
        totalBorrows: 0,
        currentBorrows: 0,
        totalDownloads: 0,
        viewCount: 0,
        averageRating: 0,
        reviewCount: 0
      },
      featured: !!featured,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await booksCollection.insertOne(bookDocument);
    
    // Get the created book
    const newBook = await booksCollection.findOne({ _id: result.insertedId });

    console.log("✅ BOOK CREATED SUCCESSFULLY, ID:", result.insertedId);

    const fileData = newBook.copies?.find(c => c.file?.url)?.file;
    
    // Transform response
    const transformedBook = {
      id: newBook._id,
      title: newBook.title,
      author: Array.isArray(newBook.authors) ? newBook.authors.join(", ") : newBook.authors,
      description: newBook.description,
      isbn: newBook.isbn,
      category: newBook.category,
      dewey_number: newBook.deweyDecimal,
      dewey_hierarchy: newBook.deweyHierarchy,
      price: newBook.price,
      format: newBook.format,
      cover_image: getFileUrl(newBook.coverImage, 'image'),
      file_url: fileData ? getFileUrl(fileData.url, 'file') : null,
      file_size: fileData?.size || null,
      file_name: fileData?.name || null,
      file_type: fileData?.type || null,
      pages: newBook.publication?.pages || null,
      publisher: newBook.publication?.publisher || null,
      published_date: newBook.publication?.year ? new Date(newBook.publication.year, 0, 1).toISOString().split('T')[0] : null,
      language: newBook.publication?.language || "English",
      rating: newBook.statistics?.averageRating || 0,
      total_ratings: newBook.statistics?.reviewCount || 0,
      downloads: newBook.statistics?.totalDownloads || 0,
      status: newBook.availability?.status || "available",
      total_copies: newBook.availability?.totalCopies || 0,
      available_copies: newBook.availability?.availableCopies || 0,
      featured: newBook.featured || false,
      created_at: newBook.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: {
        book: transformedBook,
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

// Update book - FIXED: Remove arrayFilters issue
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📥 UPDATE BOOK REQUEST:", {
      id,
      body: req.body,
      files: req.files,
    });

    const booksCollection = await getCollection("books");

    // Check if book exists
    const existingBook = await booksCollection.findOne({ _id: new ObjectId(id) });

    if (!existingBook) {
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
    const bookPrice = parseFloat(price) || existingBook.price || 0;
    if (bookPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Prepare update operations
    const updateOperations = { $set: { updatedAt: new Date() } };

    // Update basic fields if provided
    if (title !== undefined) updateOperations.$set.title = safeValue(title);
    if (author !== undefined) {
      const authors = Array.isArray(author) ? author : 
                     typeof author === 'string' && author.includes(',') ? 
                     author.split(',').map(a => a.trim()) : [author];
      updateOperations.$set.authors = authors;
    }
    if (description !== undefined) updateOperations.$set.description = safeValue(description);
    if (isbn !== undefined) updateOperations.$set.isbn = safeValue(isbn);
    if (category !== undefined) updateOperations.$set.category = safeValue(category);
    if (dewey_number !== undefined) {
      updateOperations.$set.deweyDecimal = safeValue(dewey_number);
      
      // Update Dewey hierarchy
      const deweyHierarchy = [];
      if (dewey_number) {
        const parts = dewey_number.split('.');
        let current = "";
        for (let i = 0; i < parts.length; i++) {
          current = i === 0 ? parts[i] : `${current}.${parts[i]}`;
          deweyHierarchy.push(current);
        }
      }
      updateOperations.$set.deweyHierarchy = deweyHierarchy;
    }
    if (price !== undefined) updateOperations.$set.price = bookPrice;
    if (format !== undefined) updateOperations.$set.format = safeValue(format);
    if (featured !== undefined) updateOperations.$set.featured = !!featured;

    // Update publication info
    if (pages !== undefined || publisher !== undefined || published_date !== undefined || language !== undefined) {
      updateOperations.$set.publication = updateOperations.$set.publication || {};
      if (pages !== undefined) updateOperations.$set.publication.pages = parseInt(pages) || null;
      if (publisher !== undefined) updateOperations.$set.publication.publisher = safeValue(publisher);
      if (published_date !== undefined) {
        updateOperations.$set.publication.year = published_date ? parseInt(published_date.split('-')[0]) : null;
      }
      if (language !== undefined) updateOperations.$set.publication.language = safeValue(language) || "English";
    }

    // Update availability status
    if (status !== undefined) {
      updateOperations.$set["availability.status"] = safeValue(status) || "available";
    }

    // Handle file uploads
    if (req.files?.cover_image?.[0]) {
      const coverFile = req.files.cover_image[0];
      updateOperations.$set.coverImage = coverFile.filename;
      console.log("🖼️ New book cover uploaded:", coverFile.filename);
    }

    if (req.files?.book_file?.[0]) {
      const bookFile = req.files.book_file[0];
      const bookFileData = {
        url: bookFile.filename,
        name: bookFile.originalname,
        type: bookFile.mimetype,
        size: bookFile.size,
        downloadCount: 0
      };
      
      // Find existing digital copy or create new one
      const existingDigitalCopyIndex = existingBook.copies?.findIndex(c => c.type === 'digital');
      
      if (existingDigitalCopyIndex !== -1 && existingDigitalCopyIndex !== undefined) {
        // Update existing digital copy
        const copyId = existingBook.copies[existingDigitalCopyIndex].copyId;
        
        // Find the digital copy and update it
        await booksCollection.updateOne(
          { _id: new ObjectId(id), "copies.copyId": copyId },
          { 
            $set: { 
              "copies.$.file": bookFileData
            } 
          }
        );
      } else {
        // Create new digital copy
        const newCopy = {
          copyId: `DIG-${Date.now().toString().slice(-6)}`,
          type: "digital",
          status: "available",
          file: bookFileData
        };
        
        await booksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $push: { copies: newCopy } }
        );
      }
      
      console.log("📄 New book file uploaded:", bookFile.filename);
    }

    // Calculate total copies if changed
    if (total_copies !== undefined) {
      const totalCopies = parseInt(total_copies) || 1;
      const currentPhysicalCopies = existingBook.copies?.filter(c => c.type === 'physical').length || 0;
      
      // Update availability counts
      updateOperations.$set["availability.totalCopies"] = totalCopies;
      updateOperations.$set["availability.physicalCopies"] = currentPhysicalCopies;
      
      // Count digital copies
      const digitalCopies = existingBook.copies?.filter(c => c.type === 'digital').length || 0;
      updateOperations.$set["availability.digitalCopies"] = digitalCopies;
      
      // Adjust available copies if needed
      const borrowedCopies = (existingBook.availability?.totalCopies || 0) - (existingBook.availability?.availableCopies || 0);
      const newAvailableCopies = Math.max(0, totalCopies - borrowedCopies);
      updateOperations.$set["availability.availableCopies"] = newAvailableCopies;
    }

    // Perform update (only if we have updates to make)
    if (Object.keys(updateOperations.$set).length > 1) { // More than just updatedAt
      const result = await booksCollection.updateOne(
        { _id: new ObjectId(id) },
        updateOperations
      );

      if (result.modifiedCount === 0) {
        console.log("⚠️ No changes made to book document");
      }
    }

    // Get updated book
    const updatedBook = await booksCollection.findOne({ _id: new ObjectId(id) });

    console.log("✅ BOOK UPDATED SUCCESSFULLY, ID:", id);

    const fileData = updatedBook.copies?.find(c => c.file?.url)?.file;
    
    // Transform response
    const transformedBook = {
      id: updatedBook._id,
      title: updatedBook.title,
      author: Array.isArray(updatedBook.authors) ? updatedBook.authors.join(", ") : updatedBook.authors,
      description: updatedBook.description,
      isbn: updatedBook.isbn,
      category: updatedBook.category,
      dewey_number: updatedBook.deweyDecimal,
      dewey_hierarchy: updatedBook.deweyHierarchy,
      price: updatedBook.price || 0,
      format: updatedBook.format || "digital",
      cover_image: getFileUrl(updatedBook.coverImage, 'image'),
      file_url: fileData ? getFileUrl(fileData.url, 'file') : null,
      file_size: fileData?.size || null,
      file_name: fileData?.name || null,
      file_type: fileData?.type || null,
      pages: updatedBook.publication?.pages || null,
      publisher: updatedBook.publication?.publisher || null,
      published_date: updatedBook.publication?.year ? new Date(updatedBook.publication.year, 0, 1).toISOString().split('T')[0] : null,
      language: updatedBook.publication?.language || "English",
      rating: updatedBook.statistics?.averageRating || 0,
      total_ratings: updatedBook.statistics?.reviewCount || 0,
      downloads: updatedBook.statistics?.totalDownloads || 0,
      status: updatedBook.availability?.status || "available",
      total_copies: updatedBook.availability?.totalCopies || 0,
      available_copies: updatedBook.availability?.availableCopies || 0,
      featured: updatedBook.featured || false,
      created_at: updatedBook.createdAt,
      updated_at: updatedBook.updatedAt
    };

    res.json({
      success: true,
      message: "Book updated successfully",
      data: {
        book: transformedBook,
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

    const booksCollection = await getCollection("books");

    // Check if book exists
    const existingBook = await booksCollection.findOne({ _id: new ObjectId(id) });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    await booksCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          "availability.status": status,
          updatedAt: new Date()
        } 
      }
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

    const booksCollection = await getCollection("books");

    // Check if book exists
    const existingBook = await booksCollection.findOne({ _id: new ObjectId(id) });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Delete associated files from filesystem
    try {
      // Delete cover image if exists
      if (existingBook.coverImage) {
        // Extract just the filename
        let coverImage = existingBook.coverImage;
        if (coverImage.includes('uploads/')) {
          coverImage = coverImage.split('/').pop();
        }
        
        const imagePath = path.join(process.cwd(), 'uploads', 'books', 'images', coverImage);
        const altImagePath = path.join(process.cwd(), 'uploads', 'images', coverImage);
        
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("🗑️ Deleted book cover from books/images:", coverImage);
        } else if (fs.existsSync(altImagePath)) {
          fs.unlinkSync(altImagePath);
          console.log("🗑️ Deleted book cover from images:", coverImage);
        }
      }
      
      // Delete book files from digital copies
      if (existingBook.copies) {
        for (const copy of existingBook.copies) {
          if (copy.type === 'digital' && copy.file?.url) {
            // Extract just the filename
            let filename = copy.file.url;
            if (filename.includes('uploads/')) {
              filename = filename.split('/').pop();
            }
            
            const filePath = path.join(process.cwd(), 'uploads', 'books', 'files', filename);
            const altFilePath = path.join(process.cwd(), 'uploads', 'files', filename);
            
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log("🗑️ Deleted book file from books/files:", filename);
            } else if (fs.existsSync(altFilePath)) {
              fs.unlinkSync(altFilePath);
              console.log("🗑️ Deleted book file from files:", filename);
            }
          }
        }
      }
    } catch (fileError) {
      console.error("Error deleting book files:", fileError);
      // Continue with DB deletion even if file deletion fails
    }

    // Delete the book from database
    await booksCollection.deleteOne({ _id: new ObjectId(id) });

    // Also delete associated transactions
    const transactionsCollection = await getCollection("transactions");
    await transactionsCollection.deleteMany({ "book.bookId": new ObjectId(id) });

    console.log(`🗑️ Book deleted: ${existingBook.title} (ID: ${id})`);

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

    const booksCollection = await getCollection("books");

    const booksCursor = booksCollection.find({
      featured: true,
      "availability.status": "available"
    }, {
      projection: {
        _id: 1,
        title: 1,
        authors: 1,
        description: 1,
        category: 1,
        deweyDecimal: 1,
        price: 1,
        format: 1,
        coverImage: 1,
        "publication.pages": 1,
        "publication.publisher": 1,
        "publication.year": 1,
        "publication.language": 1,
        "statistics.averageRating": 1,
        "statistics.reviewCount": 1,
        "statistics.totalDownloads": 1,
        "availability.availableCopies": 1,
        featured: 1
      }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    const books = await booksCursor.toArray();

    // Transform books
    const transformedBooks = books.map(book => ({
      id: book._id,
      title: book.title,
      author: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
      description: book.description,
      category: book.category,
      dewey_number: book.deweyDecimal,
      price: book.price || 0,
      format: book.format || "digital",
      cover_image: getFileUrl(book.coverImage, 'image'),
      pages: book.publication?.pages || null,
      publisher: book.publication?.publisher || null,
      published_date: book.publication?.year ? new Date(book.publication.year, 0, 1).toISOString().split('T')[0] : null,
      language: book.publication?.language || "English",
      rating: book.statistics?.averageRating || 0,
      total_ratings: book.statistics?.reviewCount || 0,
      downloads: book.statistics?.totalDownloads || 0,
      available_copies: book.availability?.availableCopies || 0,
      featured: book.featured || false
    }));

    res.json({
      success: true,
      data: {
        books: transformedBooks,
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
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const booksCollection = await getCollection("books");

    const query = {
      category: category,
      "availability.status": "available"
    };

    const booksCursor = booksCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        authors: 1,
        description: 1,
        category: 1,
        deweyDecimal: 1,
        price: 1,
        format: 1,
        coverImage: 1,
        "publication.pages": 1,
        "publication.publisher": 1,
        "publication.year": 1,
        "publication.language": 1,
        "statistics.averageRating": 1,
        "statistics.reviewCount": 1,
        "statistics.totalDownloads": 1,
        "availability.availableCopies": 1,
        featured: 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const books = await booksCursor.toArray();

    // Get total count
    const total = await booksCollection.countDocuments(query);

    // Transform books
    const transformedBooks = books.map(book => ({
      id: book._id,
      title: book.title,
      author: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
      description: book.description,
      category: book.category,
      dewey_number: book.deweyDecimal,
      price: book.price || 0,
      format: book.format || "digital",
      cover_image: getFileUrl(book.coverImage, 'image'),
      pages: book.publication?.pages || null,
      publisher: book.publication?.publisher || null,
      published_date: book.publication?.year ? new Date(book.publication.year, 0, 1).toISOString().split('T')[0] : null,
      language: book.publication?.language || "English",
      rating: book.statistics?.averageRating || 0,
      total_ratings: book.statistics?.reviewCount || 0,
      downloads: book.statistics?.totalDownloads || 0,
      available_copies: book.availability?.availableCopies || 0,
      featured: book.featured || false
    }));

    res.json({
      success: true,
      data: {
        books: transformedBooks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
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
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const booksCollection = await getCollection("books");

    // MongoDB text search
    const searchQuery = {
      "availability.status": "available",
      $text: { $search: query }
    };

    const booksCursor = booksCollection.find(searchQuery, {
      projection: {
        _id: 1,
        title: 1,
        authors: 1,
        description: 1,
        category: 1,
        deweyDecimal: 1,
        price: 1,
        format: 1,
        coverImage: 1,
        "publication.pages": 1,
        "publication.publisher": 1,
        "publication.year": 1,
        "publication.language": 1,
        "statistics.averageRating": 1,
        "statistics.reviewCount": 1,
        "statistics.totalDownloads": 1,
        "availability.availableCopies": 1,
        featured: 1,
        score: { $meta: "textScore" }
      }
    })
    .sort({ score: { $meta: "textScore" }, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const books = await booksCursor.toArray();

    // Get total count
    const total = await booksCollection.countDocuments(searchQuery);

    // Transform books
    const transformedBooks = books.map(book => ({
      id: book._id,
      title: book.title,
      author: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
      description: book.description,
      category: book.category,
      dewey_number: book.deweyDecimal,
      price: book.price || 0,
      format: book.format || "digital",
      cover_image: getFileUrl(book.coverImage, 'image'),
      pages: book.publication?.pages || null,
      publisher: book.publication?.publisher || null,
      published_date: book.publication?.year ? new Date(book.publication.year, 0, 1).toISOString().split('T')[0] : null,
      language: book.publication?.language || "English",
      rating: book.statistics?.averageRating || 0,
      total_ratings: book.statistics?.reviewCount || 0,
      downloads: book.statistics?.totalDownloads || 0,
      available_copies: book.availability?.availableCopies || 0,
      featured: book.featured || false
    }));

    res.json({
      success: true,
      data: {
        books: transformedBooks,
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
    const booksCollection = await getCollection("books");

    const categories = await booksCollection.aggregate([
      {
        $match: {
          "availability.status": "available"
        }
      },
      {
        $group: {
          _id: "$category",
          book_count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          book_count: 1,
          _id: 0
        }
      },
      {
        $sort: { book_count: -1 }
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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log("=== ADMIN BOOKS API DEBUG ===");
    console.log("Page:", pageNum, "Limit:", limitNum, "Skip:", skip);
    console.log("Status:", status);

    const booksCollection = await getCollection("books");

    // Build query
    const query = {};
    
    // Filter by status if not "all"
    if (status !== "all") {
      query["availability.status"] = status;
    }

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    console.log("MongoDB Admin Query:", JSON.stringify(query, null, 2));

    const booksCursor = booksCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        authors: 1,
        description: 1,
        isbn: 1,
        category: 1,
        deweyDecimal: 1,
        deweyHierarchy: 1,
        price: 1,
        format: 1,
        coverImage: 1,
        "copies.file.url": 1,
        "copies.file.size": 1,
        "copies.file.name": 1,
        "copies.file.type": 1,
        "publication.pages": 1,
        "publication.publisher": 1,
        "publication.year": 1,
        "publication.language": 1,
        "statistics.averageRating": 1,
        "statistics.reviewCount": 1,
        "statistics.totalDownloads": 1,
        availability: 1,
        featured: 1,
        createdAt: 1,
        updatedAt: 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

    const books = await booksCursor.toArray();

    // Get total count
    const total = await booksCollection.countDocuments(query);

    console.log(`📚 Admin: Returning ${books.length} books out of ${total} total`);

    // Transform books
    const transformedBooks = books.map(book => {
      const fileData = book.copies?.find(c => c.file?.url)?.file;
      return {
        id: book._id,
        title: book.title,
        author: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
        description: book.description,
        isbn: book.isbn,
        category: book.category,
        dewey_number: book.deweyDecimal,
        dewey_hierarchy: book.deweyHierarchy,
        price: book.price || 0,
        format: book.format || "digital",
        cover_image: getFileUrl(book.coverImage, 'image'),
        file_url: fileData ? getFileUrl(fileData.url, 'file') : null,
        file_size: fileData?.size || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
        pages: book.publication?.pages || null,
        publisher: book.publication?.publisher || null,
        published_date: book.publication?.year ? new Date(book.publication.year, 0, 1).toISOString().split('T')[0] : null,
        language: book.publication?.language || "English",
        rating: book.statistics?.averageRating || 0,
        total_ratings: book.statistics?.reviewCount || 0,
        downloads: book.statistics?.totalDownloads || 0,
        status: book.availability?.status || "available",
        total_copies: book.availability?.totalCopies || 0,
        available_copies: book.availability?.availableCopies || 0,
        featured: book.featured || false,
        created_at: book.createdAt,
        updated_at: book.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        books: transformedBooks,
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
    
    const booksCollection = await getCollection("books");
    
    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book or file not found",
      });
    }

    // Find digital copy
    const digitalCopy = book.copies?.find(copy => 
      copy.type === 'digital' && copy.file?.url
    );
    
    if (!digitalCopy) {
      return res.status(404).json({
        success: false,
        message: "Digital file not available for this book",
      });
    }

    const downloadUrl = getFileUrl(digitalCopy.file.url, 'file');

    res.json({
      success: true,
      data: {
        download_url: downloadUrl,
        file_name: digitalCopy.file.name,
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

// ================== PAYMENT & ACCESS CONTROL FUNCTIONS (UPDATED FOR MONGODB) ==================

// Create book payment record
export const createBookPayment = async (req, res) => {
  try {
    const { book_id, amount, transaction_id, payment_method = "manual" } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user._id;

    const booksCollection = await getCollection("books");
    const transactionsCollection = await getCollection("transactions");

    // Verify book exists and is available
    const book = await booksCollection.findOne({
      _id: new ObjectId(book_id),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found or not available",
      });
    }

    const bookPrice = book.price || 0;
    
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
    const existingAccess = await transactionsCollection.findOne({
      "user.userId": userId,
      "book.bookId": new ObjectId(book_id),
      type: "purchase",
      status: "completed",
      $or: [
        { "dates.expiresAt": { $gt: new Date() } },
        { "dates.expiresAt": null }
      ]
    });

    if (existingAccess) {
      return res.status(400).json({
        success: false,
        message: "You already have access to this book",
      });
    }

    // Create transaction record
    const transaction = {
      transactionId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "purchase",
      status: "completed",
      user: {
        userId: userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      book: {
        bookId: new ObjectId(book_id),
        title: book.title,
        authors: book.authors,
        isbn: book.isbn,
        deweyDecimal: book.deweyDecimal,
        price: bookPrice
      },
      payment: {
        amount: parseFloat(amount),
        transactionId: transaction_id,
        paymentMethod: payment_method,
        status: "completed",
        paidAt: new Date()
      },
      dates: {
        purchaseDate: new Date(),
        // Permanent access for purchases
        expiresAt: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await transactionsCollection.insertOne(transaction);

    // Log the purchase
    console.log(`💰 Book payment completed: User ${userId} purchased book ${book_id} for $${amount}`);

    res.json({
      success: true,
      message: "Payment completed and access granted",
      data: {
        payment_id: result.insertedId,
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
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user._id;

    const booksCollection = await getCollection("books");
    const transactionsCollection = await getCollection("transactions");

    // Verify book exists and is available
    const book = await booksCollection.findOne({
      _id: new ObjectId(book_id),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found or not available",
      });
    }
    
    // Check if book has physical copies
    const hasPhysicalCopies = book.copies?.some(c => c.type === 'physical');
    
    if (!hasPhysicalCopies) {
      return res.status(400).json({
        success: false,
        message: "This book is not available for borrowing",
      });
    }
    
    // Check if copies are available
    if (book.availability?.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "No copies available for borrowing",
      });
    }

    // Check if user already has this book borrowed
    const existingBorrow = await transactionsCollection.findOne({
      "user.userId": userId,
      "book.bookId": new ObjectId(book_id),
      type: "borrow",
      status: "active",
      "dates.expiresAt": { $gt: new Date() }
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: "You already have this book borrowed",
      });
    }

    // Reduce available copies
    await booksCollection.updateOne(
      { _id: new ObjectId(book_id) },
      { 
        $inc: { 
          "availability.availableCopies": -1,
          "availability.loanedCopies": 1
        }
      }
    );

    // Create borrow transaction (14 days borrowing period)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const transaction = {
      transactionId: `BOR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "borrow",
      status: "active",
      user: {
        userId: userId,
        name: req.user.name,
        email: req.user.email
      },
      book: {
        bookId: new ObjectId(book_id),
        title: book.title,
        authors: book.authors,
        isbn: book.isbn,
        deweyDecimal: book.deweyDecimal
      },
      copy: {
        copyId: book.copies?.find(c => c.type === 'physical' && c.status === 'available')?.copyId || "PHYS-001"
      },
      dates: {
        borrowDate: new Date(),
        dueDate: expiresAt,
        expectedReturnDate: expiresAt,
        expiresAt: expiresAt
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await transactionsCollection.insertOne(transaction);

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
        access_type: 'borrow',
        transaction_id: transaction.transactionId
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
    const { transaction_id } = req.params;
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user._id;

    const transactionsCollection = await getCollection("transactions");
    const booksCollection = await getCollection("books");

    // Check if transaction exists and belongs to user
    const transaction = await transactionsCollection.findOne({
      transactionId: transaction_id,
      "user.userId": userId,
      type: "borrow",
      status: "active"
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found",
      });
    }

    const bookId = transaction.book.bookId;

    // Mark transaction as returned
    await transactionsCollection.updateOne(
      { transactionId: transaction_id },
      { 
        $set: { 
          status: "returned",
          "dates.returnDate": new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Increase available copies
    await booksCollection.updateOne(
      { _id: bookId },
      { 
        $inc: { 
          "availability.availableCopies": 1,
          "availability.loanedCopies": -1
        }
      }
    );

    console.log(`📚 Book returned: User ${userId} returned book ${bookId}`);

    res.json({
      success: true,
      message: "Book returned successfully",
      data: {
        book_id: bookId,
        book_title: transaction.book.title,
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
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactionsCollection = await getCollection("transactions");

    const query = {
      "user.userId": userId,
      type: "borrow",
      status: "active",
      "dates.expiresAt": { $gt: new Date() }
    };

    const transactionsCursor = transactionsCollection.find(query, {
      projection: {
        _id: 1,
        transactionId: 1,
        book: 1,
        dates: 1,
        status: 1,
        createdAt: 1
      }
    })
    .sort({ "dates.dueDate": 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const transactions = await transactionsCursor.toArray();

    // Get total count
    const total = await transactionsCollection.countDocuments(query);

    // Transform transactions to book format
    const books = transactions.map(transaction => ({
      id: transaction.book.bookId,
      title: transaction.book.title,
      authors: transaction.book.authors,
      borrow_date: transaction.dates.borrowDate,
      due_date: transaction.dates.dueDate,
      expires_at: transaction.dates.expiresAt,
      transaction_id: transaction.transactionId
    }));

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
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
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactionsCollection = await getCollection("transactions");

    const query = {
      "user.userId": userId,
      type: "purchase",
      status: "completed"
    };

    const transactionsCursor = transactionsCollection.find(query, {
      projection: {
        _id: 1,
        transactionId: 1,
        book: 1,
        payment: 1,
        dates: 1,
        status: 1,
        createdAt: 1
      }
    })
    .sort({ "dates.purchaseDate": -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const transactions = await transactionsCursor.toArray();

    // Get total count
    const total = await transactionsCollection.countDocuments(query);

    // Transform transactions to book format
    const books = transactions.map(transaction => ({
      id: transaction.book.bookId,
      title: transaction.book.title,
      authors: transaction.book.authors,
      price: transaction.book.price,
      paid_amount: transaction.payment?.amount || transaction.book.price,
      payment_date: transaction.dates.purchaseDate,
      transaction_id: transaction.transactionId || transaction.payment?.transactionId
    }));

    // Calculate total spent
    const totalSpent = books.reduce((sum, book) => sum + parseFloat(book.paid_amount || 0), 0);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          total_purchased: total,
          total_spent: totalSpent
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
    
    if (req.user && req.user._id) {
      userId = req.user._id;
    }

    const accessCheck = await checkBookAccess(userId, id);
    
    const booksCollection = await getCollection("books");
    
    // Get book details
    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      data: {
        book_id: id,
        book_title: book.title,
        book_price: book.price || 0,
        book_format: book.format || "digital",
        has_access: accessCheck.hasAccess,
        is_free: (book.price || 0) === 0,
        requires_payment: (book.price || 0) > 0 && !accessCheck.hasAccess,
        requires_login: accessCheck.requiresLogin || false,
        available_copies: book.availability?.availableCopies || 0,
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