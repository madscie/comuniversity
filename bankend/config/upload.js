// config/upload.js
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on file type
    let uploadPath = 'uploads/';
    if (file.fieldname === 'cover_image') {
      uploadPath += 'covers/';
    } else if (file.fieldname === 'file_url') {
      uploadPath += 'books/';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images for covers
  if (file.fieldname === 'cover_image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover images'), false);
    }
  }
  // Allow PDFs and other documents for book files
  else if (file.fieldname === 'file_url') {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.epub'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, EPUB files are allowed'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

module.exports = upload;