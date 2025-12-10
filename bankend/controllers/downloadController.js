import crypto from 'crypto';
import { getCollection } from '../config/database.js';
import { ObjectId } from 'mongodb';

// Get download token for a book
export const getDownloadToken = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id; // MongoDB uses _id

    const transactionsCollection = await getCollection('transactions');
    const booksCollection = await getCollection('books');
    const downloadsCollection = await getCollection('downloads');

    // Check if user has access to the book (purchased or borrowed)
    const access = await transactionsCollection.findOne({
      "user.userId": userId,
      "book.bookId": new ObjectId(bookId),
      $or: [
        { 
          type: "purchase", 
          status: "completed",
          $or: [
            { "dates.expiresAt": null },
            { "dates.expiresAt": { $gt: new Date() } }
          ]
        },
        { 
          type: "borrow", 
          status: "active",
          "dates.expiresAt": { $gt: new Date() }
        }
      ]
    });

    if (!access) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have access to download this book'
      });
    }

    // Get book details to check for digital copies
    const book = await booksCollection.findOne({
      _id: new ObjectId(bookId),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Find digital copy
    const digitalCopy = book.copies?.find(copy => 
      copy.type === 'digital' && copy.file?.url
    );

    if (!digitalCopy) {
      return res.status(400).json({
        status: 'error',
        message: 'This book does not have a digital version available for download'
      });
    }

    // Generate download token
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create download record in MongoDB
    const downloadRecord = {
      downloadId: `DL-${Date.now().toString().slice(-8)}`,
      userId: userId,
      userEmail: req.user.email,
      userName: req.user.name,
      bookId: new ObjectId(bookId),
      bookTitle: book.title,
      bookAuthors: book.authors,
      downloadToken: downloadToken,
      format: digitalCopy.file.type || 'PDF',
      fileUrl: digitalCopy.file.url,
      fileName: digitalCopy.file.name,
      fileSize: digitalCopy.file.size,
      status: 'pending',
      expiresAt: expiresAt,
      accessType: access.type,
      transactionId: access._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await downloadsCollection.insertOne(downloadRecord);

    res.json({
      status: 'success',
      data: {
        downloadToken: downloadToken,
        bookId: bookId,
        bookTitle: book.title,
        bookAuthors: book.authors,
        fileUrl: digitalCopy.file.url,
        fileName: digitalCopy.file.name,
        fileSize: digitalCopy.file.size,
        expiresAt: expiresAt,
        downloadId: downloadRecord.downloadId,
        format: downloadRecord.format,
        accessType: access.type
      }
    });
  } catch (error) {
    console.error('Get download token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Download book using token
export const downloadBook = async (req, res) => {
  try {
    const { token } = req.params;

    const downloadsCollection = await getCollection('downloads');
    const booksCollection = await getCollection('books');
    const transactionsCollection = await getCollection('transactions');

    // Verify download token
    const download = await downloadsCollection.findOne({
      downloadToken: token,
      expiresAt: { $gt: new Date() },
      status: 'pending'
    });

    if (!download) {
      return res.status(404).json({
        status: 'error',
        message: 'Download token invalid or expired'
      });
    }

    // Check if the original access is still valid
    const access = await transactionsCollection.findOne({
      _id: download.transactionId,
      $or: [
        { 
          type: "purchase", 
          status: "completed",
          $or: [
            { "dates.expiresAt": null },
            { "dates.expiresAt": { $gt: new Date() } }
          ]
        },
        { 
          type: "borrow", 
          status: "active",
          "dates.expiresAt": { $gt: new Date() }
        }
      ]
    });

    if (!access) {
      // Mark download as invalid
      await downloadsCollection.updateOne(
        { downloadToken: token },
        { $set: { status: 'invalid', updatedAt: new Date() } }
      );
      
      return res.status(403).json({
        status: 'error',
        message: 'Your access to this book has expired'
      });
    }

    // Get book to verify it still exists and has the file
    const book = await booksCollection.findOne({
      _id: download.bookId,
      "availability.status": "available"
    });

    if (!book) {
      await downloadsCollection.updateOne(
        { downloadToken: token },
        { $set: { status: 'book_not_found', updatedAt: new Date() } }
      );
      
      return res.status(404).json({
        status: 'error',
        message: 'Book no longer available'
      });
    }

    // Find the specific digital copy
    const digitalCopy = book.copies?.find(copy => 
      copy.type === 'digital' && copy.file?.url === download.fileUrl
    );

    if (!digitalCopy) {
      await downloadsCollection.updateOne(
        { downloadToken: token },
        { $set: { status: 'file_not_found', updatedAt: new Date() } }
      );
      
      return res.status(404).json({
        status: 'error',
        message: 'Book file no longer available'
      });
    }

    // Update download status to completed
    await downloadsCollection.updateOne(
      { downloadToken: token },
      { 
        $set: { 
          status: 'completed',
          downloadedAt: new Date(),
          downloadCount: (download.downloadCount || 0) + 1,
          updatedAt: new Date()
        } 
      }
    );

    // Update book download statistics
    await booksCollection.updateOne(
      { _id: download.bookId },
      { 
        $inc: { 
          "statistics.totalDownloads": 1,
          "copies.$[copy].file.downloadCount": 1
        } 
      },
      {
        arrayFilters: [
          { "copy.type": "digital", "copy.file.url": download.fileUrl }
        ]
      }
    );

    // Update user's download history in their profile
    const usersCollection = await getCollection('users');
    await usersCollection.updateOne(
      { _id: download.userId },
      { 
        $push: { 
          downloadHistory: {
            bookId: download.bookId,
            bookTitle: download.bookTitle,
            downloadedAt: new Date(),
            downloadToken: token,
            format: download.format
          }
        },
        $inc: { "statistics.totalDownloads": 1 }
      }
    );

    // Return download information
    res.json({
      status: 'success',
      data: {
        downloadId: download.downloadId,
        downloadUrl: `/api/downloads/file/${token}`, // Route to actually serve the file
        secureDownloadUrl: `/api/downloads/secure/${token}`, // Alternative secure route
        fileName: download.fileName || `${download.bookTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        fileSize: download.fileSize,
        bookTitle: download.bookTitle,
        bookAuthors: download.bookAuthors,
        format: download.format,
        expiresAt: download.expiresAt,
        downloadCount: (download.downloadCount || 0) + 1
      }
    });
  } catch (error) {
    console.error('Download book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Serve the actual file (separate endpoint for security)
export const serveDownloadFile = async (req, res) => {
  try {
    const { token } = req.params;
    const downloadsCollection = await getCollection('downloads');

    // Verify download token and check if download was completed
    const download = await downloadsCollection.findOne({
      downloadToken: token,
      status: 'completed',
      expiresAt: { $gt: new Date() }
    });

    if (!download) {
      return res.status(404).json({
        status: 'error',
        message: 'Download link invalid or expired'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'files', download.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      await downloadsCollection.updateOne(
        { downloadToken: token },
        { $set: { status: 'file_missing', updatedAt: new Date() } }
      );
      
      return res.status(404).json({
        status: 'error',
        message: 'File not found on server'
      });
    }

    // Set headers for file download
    const fileName = download.fileName || `${download.bookTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', download.fileSize || fs.statSync(filePath).size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Error streaming file'
        });
      }
    });
  } catch (error) {
    console.error('Serve download file error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user's download history
export const getDownloadHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const downloadsCollection = await getCollection('downloads');

    const query = { userId: userId };
    const downloadsCursor = downloadsCollection.find(query, {
      projection: {
        downloadId: 1,
        bookId: 1,
        bookTitle: 1,
        bookAuthors: 1,
        downloadedAt: 1,
        format: 1,
        fileSize: 1,
        status: 1,
        expiresAt: 1
      }
    })
    .sort({ downloadedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const downloads = await downloadsCursor.toArray();
    const total = await downloadsCollection.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        downloads: downloads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get download history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Revoke a download token (admin function)
export const revokeDownloadToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const downloadsCollection = await getCollection('downloads');

    const result = await downloadsCollection.updateOne(
      { downloadToken: token },
      { 
        $set: { 
          status: 'revoked',
          revokedAt: new Date(),
          revokedBy: req.user._id,
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Download token not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Download token revoked successfully'
    });
  } catch (error) {
    console.error('Revoke download token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Generate bulk download tokens (for multiple books)
export const generateBulkDownloadTokens = async (req, res) => {
  try {
    const { bookIds } = req.body; // Array of book IDs
    const userId = req.user._id;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Book IDs array is required'
      });
    }

    // Limit bulk requests
    if (bookIds.length > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 10 books per bulk request'
      });
    }

    const transactionsCollection = await getCollection('transactions');
    const booksCollection = await getCollection('books');
    const downloadsCollection = await getCollection('downloads');

    const tokens = [];
    const errors = [];

    // Process each book
    for (const bookId of bookIds) {
      try {
        // Check access for each book
        const access = await transactionsCollection.findOne({
          "user.userId": userId,
          "book.bookId": new ObjectId(bookId),
          $or: [
            { 
              type: "purchase", 
              status: "completed",
              $or: [
                { "dates.expiresAt": null },
                { "dates.expiresAt": { $gt: new Date() } }
              ]
            },
            { 
              type: "borrow", 
              status: "active",
              "dates.expiresAt": { $gt: new Date() } 
            }
          ]
        });

        if (!access) {
          errors.push({
            bookId: bookId,
            error: 'No access to this book'
          });
          continue;
        }

        // Get book details
        const book = await booksCollection.findOne({
          _id: new ObjectId(bookId),
          "availability.status": "available"
        });

        if (!book) {
          errors.push({
            bookId: bookId,
            error: 'Book not found'
          });
          continue;
        }

        // Find digital copy
        const digitalCopy = book.copies?.find(copy => 
          copy.type === 'digital' && copy.file?.url
        );

        if (!digitalCopy) {
          errors.push({
            bookId: bookId,
            error: 'No digital version available'
          });
          continue;
        }

        // Generate download token
        const downloadToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create download record
        const downloadRecord = {
          downloadId: `DL-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4)}`,
          userId: userId,
          userEmail: req.user.email,
          userName: req.user.name,
          bookId: new ObjectId(bookId),
          bookTitle: book.title,
          bookAuthors: book.authors,
          downloadToken: downloadToken,
          format: digitalCopy.file.type || 'PDF',
          fileUrl: digitalCopy.file.url,
          fileName: digitalCopy.file.name,
          fileSize: digitalCopy.file.size,
          status: 'pending',
          expiresAt: expiresAt,
          accessType: access.type,
          transactionId: access._id,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await downloadsCollection.insertOne(downloadRecord);

        tokens.push({
          bookId: bookId,
          bookTitle: book.title,
          downloadToken: downloadToken,
          expiresAt: expiresAt,
          format: downloadRecord.format
        });

      } catch (bookError) {
        errors.push({
          bookId: bookId,
          error: bookError.message
        });
      }
    }

    res.json({
      status: 'success',
      data: {
        tokens: tokens,
        errors: errors,
        totalRequested: bookIds.length,
        successful: tokens.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Generate bulk download tokens error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Import fs and path for file serving
import fs from 'fs';
import path from 'path';



