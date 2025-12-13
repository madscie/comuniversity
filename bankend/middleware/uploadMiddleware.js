// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create directories if they don't exist
const createDirectories = () => {
  const directories = [
    'uploads/images',
    'uploads/files', 
    'uploads/articles/files',
    'uploads/books/files'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Create directories on startup
createDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default to uploads root
    let folder = 'uploads/';
    
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Route based on file type AND request context
    if (file.mimetype.startsWith('image/')) {
      // Check if it's a book image
      if (req.baseUrl?.includes('book') || req.body?.type === 'book') {
        folder = 'uploads/images/';
      } 
      // Check if it's an article image
      else if (req.baseUrl?.includes('article') || req.body?.type === 'article') {
        folder = 'uploads/images/';
      }
      // Default images folder
      else {
        folder = 'uploads/images/';
      }
    }
    else if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      // PDFs for articles
      if (req.baseUrl?.includes('article') || req.body?.type === 'article') {
        folder = 'uploads/articles/files/';
      }
      // PDFs for books
      else if (req.baseUrl?.includes('book') || req.body?.type === 'book') {
        folder = 'uploads/files/';
      }
      // Other PDFs
      else {
        folder = 'uploads/files/';
      }
    }
    else if (ext === '.docx' || ext === '.doc' || 
             file.mimetype.includes('document') || 
             file.mimetype.includes('msword')) {
      // Documents go to files folder
      folder = 'uploads/files/';
    }
    
    console.log(`📁 Routing ${file.originalname} to ${folder}`);
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    
    // Clean filename (remove special characters)
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Construct final filename
    const filename = `${cleanName}_${uniqueSuffix}${extension}`;
    
    console.log(`📝 Saving as: ${filename}`);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.originalname}`));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Middleware for different upload types
export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', 10);
export const uploadDocument = upload.single('document');
export const uploadFile = upload.single('file');

// Generic upload middleware
export const uploadMiddleware = (fieldName = 'file', maxCount = 1) => {
  return upload.single(fieldName);
};

export default upload;