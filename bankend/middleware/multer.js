import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File type configuration
const FILE_TYPES = {
  IMAGE: {
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    fields: ['cover_image', 'image', 'profile_image', 'avatar']
  },
  DOCUMENT: {
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'application/rtf'
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    fields: ['book_file', 'document', 'file', 'ebook']
  },
  EBOOK: {
    allowedMimeTypes: [
      'application/epub+zip',
      'application/x-mobipocket-ebook'
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    fields: ['ebook', 'book_file']
  },
  SPREADSHEET: {
    allowedMimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet'
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    fields: ['spreadsheet', 'data_file']
  },
  PRESENTATION: {
    allowedMimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation'
    ],
    maxSize: 30 * 1024 * 1024, // 30MB
    fields: ['presentation', 'slides']
  },
  ARCHIVE: {
    allowedMimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip'
    ],
    maxSize: 200 * 1024 * 1024, // 200MB
    fields: ['archive', 'zip_file']
  }
};

// Get file type configuration by field name
const getFileTypeConfig = (fieldname) => {
  for (const [type, config] of Object.entries(FILE_TYPES)) {
    if (config.fields.includes(fieldname)) {
      return { type, ...config };
    }
  }
  
  // Default configuration for unknown fields
  return {
    type: 'GENERIC',
    allowedMimeTypes: [
      'application/octet-stream'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB default
    fields: [fieldname]
  };
};

// Configure storage with metadata tracking
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileTypeConfig = getFileTypeConfig(file.fieldname);
    let uploadPath;
    
    // Determine upload path based on file type and request context
    if (req.baseUrl?.includes('/api/books') || req.path?.includes('/books')) {
      if (file.fieldname === "cover_image") {
        uploadPath = path.join(__dirname, "../uploads/books/images");
      } else if (file.fieldname === "book_file") {
        uploadPath = path.join(__dirname, "../uploads/books/files");
      } else {
        uploadPath = path.join(__dirname, "../uploads/books");
      }
    } else if (req.baseUrl?.includes('/api/articles') || req.path?.includes('/articles')) {
      if (file.fieldname === "image") {
        uploadPath = path.join(__dirname, "../uploads/articles/images");
      } else if (file.fieldname === "document") {
        uploadPath = path.join(__dirname, "../uploads/articles/files");
      } else {
        uploadPath = path.join(__dirname, "../uploads/articles");
      }
    } else if (req.baseUrl?.includes('/api/users') || req.path?.includes('/users')) {
      uploadPath = path.join(__dirname, "../uploads/users");
    } else if (req.baseUrl?.includes('/api/webinars') || req.path?.includes('/webinars')) {
      uploadPath = path.join(__dirname, "../uploads/webinars");
    } else {
      // Generic upload path based on file type
      switch(fileTypeConfig.type) {
        case 'IMAGE':
          uploadPath = path.join(__dirname, "../uploads/images");
          break;
        case 'DOCUMENT':
        case 'EBOOK':
          uploadPath = path.join(__dirname, "../uploads/documents");
          break;
        default:
          uploadPath = path.join(__dirname, "../uploads/general");
      }
    }
    
    console.log(`📁 Multer saving ${file.fieldname} (${fileTypeConfig.type}) to:`, uploadPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`✅ Created directory: ${uploadPath}`);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileTypeConfig = getFileTypeConfig(file.fieldname);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100); // Limit filename length
    
    const ext = path.extname(sanitizedOriginalName).toLowerCase();
    const nameWithoutExt = path.basename(sanitizedOriginalName, ext);
    
    // Generate filename with metadata
    const filename = `${nameWithoutExt}_${timestamp}_${uniqueId}${ext}`;
    
    // Store file metadata in request for MongoDB
    if (!req.fileMetadata) {
      req.fileMetadata = [];
    }
    
    req.fileMetadata.push({
      fieldname: file.fieldname,
      originalname: file.originalname,
      filename: filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      encoding: file.encoding,
      fileType: fileTypeConfig.type,
      timestamp: new Date(timestamp),
      uploadId: uniqueId
    });
    
    console.log(`💾 Saving ${file.fieldname} as:`, filename, `(Type: ${fileTypeConfig.type}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    cb(null, filename);
  }
});

// Enhanced file filter with better error messages
const fileFilter = (req, file, cb) => {
  console.log(`🔍 File upload check: ${file.originalname}, Type: ${file.mimetype}, Field: ${file.fieldname}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  
  const fileTypeConfig = getFileTypeConfig(file.fieldname);
  
  // Check MIME type
  if (!fileTypeConfig.allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file type for ${file.fieldname}. Allowed types: ${fileTypeConfig.allowedMimeTypes.join(', ')}`
    );
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }
  
  // Check file size
  if (file.size > fileTypeConfig.maxSize) {
    const error = new Error(
      `File too large for ${file.fieldname}. Maximum size: ${(fileTypeConfig.maxSize / 1024 / 1024)}MB`
    );
    error.code = 'FILE_TOO_LARGE';
    return cb(error, false);
  }
  
  // Additional security checks
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.epub', '.xlsx', '.pptx', '.zip'];
  
  if (!allowedExtensions.includes(ext)) {
    const error = new Error(`File extension ${ext} not allowed`);
    error.code = 'INVALID_EXTENSION';
    return cb(error, false);
  }
  
  // Check for potentially dangerous files
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.html'];
  if (dangerousExtensions.includes(ext)) {
    const error = new Error(`Potentially dangerous file type: ${ext}`);
    error.code = 'DANGEROUS_FILE';
    return cb(error, false);
  }
  
  console.log(`✅ File validation passed for ${file.originalname}`);
  cb(null, true);
};

// Create upload instance with error handling
const createUpload = (fields) => {
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB global limit
      files: 10 // Maximum number of files
    }
  });

  return (req, res, next) => {
    const uploadMiddleware = fields ? upload.fields(fields) : upload.any();
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('❌ Multer upload error:', {
          message: err.message,
          code: err.code,
          field: err.field,
          stack: err.stack
        });
        
        // Handle specific multer errors
        let statusCode = 400;
        let errorMessage = err.message;
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            statusCode = 413;
            errorMessage = 'File too large';
            break;
          case 'LIMIT_FILE_COUNT':
            statusCode = 400;
            errorMessage = 'Too many files';
            break;
          case 'LIMIT_UNEXPECTED_FILE':
            statusCode = 400;
            errorMessage = 'Unexpected file field';
            break;
          case 'INVALID_FILE_TYPE':
            statusCode = 415;
            break;
          case 'FILE_TOO_LARGE':
            statusCode = 413;
            break;
          case 'INVALID_EXTENSION':
          case 'DANGEROUS_FILE':
            statusCode = 415;
            break;
        }
        
        return res.status(statusCode).json({
          success: false,
          message: errorMessage,
          error: err.code,
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      
      // Log successful uploads
      if (req.files || req.file) {
        const files = req.files ? Object.values(req.files).flat() : [req.file];
        console.log(`✅ Upload successful: ${files.length} file(s) uploaded`);
        
        // Add upload summary to request
        req.uploadSummary = {
          totalFiles: files.length,
          totalSize: files.reduce((sum, file) => sum + file.size, 0),
          files: files.map(file => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
          }))
        };
      }
      
      next();
    });
  };
};

// Pre-configured upload handlers for different use cases
export const uploadHandlers = {
  // Book uploads
  bookUpload: createUpload([
    { name: 'cover_image', maxCount: 1 },
    { name: 'book_file', maxCount: 1 }
  ]),
  
  // Article uploads
  articleUpload: createUpload([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  
  // User profile uploads
  profileUpload: createUpload([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 }
  ]),
  
  // Webinar uploads
  webinarUpload: createUpload([
    { name: 'image', maxCount: 1 },
    { name: 'presentation', maxCount: 1 }
  ]),
  
  // Generic file upload
  fileUpload: createUpload(),
  
  // Multiple files upload
  multipleFiles: (fields) => createUpload(fields)
};

// Utility function to save file metadata to MongoDB
export const saveFileMetadata = async (req, fileData, collectionName = 'files') => {
  try {
    const { getCollection } = await import('../config/database.js');
    const filesCollection = await getCollection(collectionName);
    
    const metadata = {
      fileId: `FILE-${Date.now().toString().slice(-8)}`,
      originalName: fileData.originalname,
      storedName: fileData.filename,
      path: fileData.path,
      size: fileData.size,
      mimetype: fileData.mimetype,
      encoding: fileData.encoding,
      fieldname: fileData.fieldname,
      uploadDate: new Date(),
      uploadedBy: req.user?._id || null,
      userEmail: req.user?.email || null,
      entityType: determineEntityType(req),
      entityId: determineEntityId(req),
      accessLevel: determineAccessLevel(req, fileData),
      status: 'active',
      downloadCount: 0,
      metadata: {
        dimensions: fileData.dimensions || null,
        duration: fileData.duration || null,
        pages: fileData.pages || null
      }
    };
    
    const result = await filesCollection.insertOne(metadata);
    console.log(`📝 File metadata saved to MongoDB with ID: ${result.insertedId}`);
    
    return { ...metadata, _id: result.insertedId };
  } catch (error) {
    console.error('❌ Failed to save file metadata to MongoDB:', error);
    return null;
  }
};

// Helper functions
const determineEntityType = (req) => {
  if (req.baseUrl?.includes('/api/books')) return 'book';
  if (req.baseUrl?.includes('/api/articles')) return 'article';
  if (req.baseUrl?.includes('/api/users')) return 'user';
  if (req.baseUrl?.includes('/api/webinars')) return 'webinar';
  return 'general';
};

const determineEntityId = (req) => {
  return req.params?.id || req.body?.id || null;
};

const determineAccessLevel = (req, fileData) => {
  if (fileData.fieldname === 'avatar' || fileData.fieldname === 'profile_image') {
    return 'private';
  }
  if (req.user?.role === 'admin') {
    return 'admin';
  }
  return 'public';
};

// Clean up orphaned files (utility function)
export const cleanupOrphanedFiles = async () => {
  try {
    const { getCollection } = await import('../config/database.js');
    const filesCollection = await getCollection('files');
    
    // Find files older than 24 hours without entity reference
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);
    
    const orphanedFiles = await filesCollection.find({
      uploadDate: { $lt: cutoffDate },
      $or: [
        { entityId: null },
        { entityId: '' }
      ],
      status: 'active'
    }).toArray();
    
    console.log(`🧹 Found ${orphanedFiles.length} orphaned files to clean up`);
    
    for (const file of orphanedFiles) {
      try {
        // Delete physical file
        const filePath = path.join(__dirname, '..', file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted orphaned file: ${file.originalName}`);
        }
        
        // Update database record
        await filesCollection.updateOne(
          { _id: file._id },
          { $set: { status: 'deleted', deletedAt: new Date() } }
        );
      } catch (fileError) {
        console.error(`❌ Failed to delete orphaned file ${file.originalName}:`, fileError.message);
      }
    }
    
    return orphanedFiles.length;
  } catch (error) {
    console.error('❌ Cleanup orphaned files error:', error);
    return 0;
  }
};

// Default export for backward compatibility
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10
  }
});

export default upload;