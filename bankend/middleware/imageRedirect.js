// middleware/imageRedirect.js
import fs from 'fs';
import path from 'path';

export const imageRedirectMiddleware = (req, res, next) => {
  // Fix for /uploads/images/ requests
  if (req.path.startsWith('/uploads/images/')) {
    const filename = req.path.split('/').pop();
    console.log(`🔄 Redirect request: ${req.path}`);
    
    // Check if file exists in articles/images
    const articleImagePath = path.join(process.cwd(), 'uploads/articles/images', filename);
    if (fs.existsSync(articleImagePath)) {
      console.log(`✅ Redirecting to /uploads/articles/images/${filename}`);
      return res.redirect(`/uploads/articles/images/${filename}`);
    }
    
    // Check if file exists in books/images
    const bookImagePath = path.join(process.cwd(), 'uploads/books/images', filename);
    if (fs.existsSync(bookImagePath)) {
      console.log(`✅ Redirecting to /uploads/books/images/${filename}`);
      return res.redirect(`/uploads/books/images/${filename}`);
    }
    
    console.log(`❌ Image not found: ${filename}`);
  }
  
  // Smart image fallback for article images
  if (req.path.startsWith('/uploads/articles/images/')) {
    const filename = req.path.split('/').pop();
    console.log(`🔍 Request for article image: ${filename}`);
    
    // First, try the exact file
    const exactPath = path.join(process.cwd(), 'uploads/articles/images', filename);
    
    if (fs.existsSync(exactPath)) {
      console.log(`✅ Serving exact file: ${filename}`);
      return res.sendFile(exactPath);
    }
    
    // If not found, check if it's one of the missing files
    const missingFiles = [
      'IMG-20251009-WA0137_1765370799659_7287d8a1dc37b15b.jpg',
      'IMG-20240408-WA0003__1__1765370586021_44fda45ae4af01f4.jpg'
    ];
    
    if (missingFiles.includes(filename)) {
      console.log(`⚠️ Missing file requested: ${filename}`);
      
      // Get all available article images
      const imagesDir = path.join(process.cwd(), 'uploads/articles/images');
      
      // Check if directory exists
      if (!fs.existsSync(imagesDir)) {
        console.log(`❌ Directory doesn't exist: ${imagesDir}`);
        return next();
      }
      
      const availableImages = fs.readdirSync(imagesDir)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
      
      console.log(`📸 Found ${availableImages.length} available article images`);
      
      if (availableImages.length > 0) {
        // Pick an image based on filename hash
        const hash = filename.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const imageIndex = hash % availableImages.length;
        const fallbackImage = availableImages[imageIndex];
        const fallbackPath = path.join(imagesDir, fallbackImage);
        
        console.log(`🔄 Serving fallback: ${fallbackImage} for ${filename}`);
        return res.sendFile(fallbackPath);
      } else {
        console.log(`❌ No article images found in ${imagesDir}`);
      }
    }
    
    // File doesn't exist and isn't in our missing list
    console.log(`❌ File not found: ${filename}`);
  }
  
  // Double path fix
  if (req.path.includes('//')) {
    console.log(`⚠️ Detected double path in URL: ${req.path}`);
    
    let correctedPath = req.path;
    
    if (correctedPath.includes('/uploads/files//uploads/books/files/')) {
      correctedPath = correctedPath.replace('/uploads/files//uploads/books/files/', '/uploads/books/files/');
      console.log(`🔄 Pattern 1 fixed: ${req.path} -> ${correctedPath}`);
    } else if (correctedPath.includes('/uploads/files/uploads/books/files/')) {
      correctedPath = correctedPath.replace('/uploads/files/uploads/books/files/', '/uploads/books/files/');
      console.log(`🔄 Pattern 2 fixed: ${req.path} -> ${correctedPath}`);
    } else if (correctedPath.includes('/uploads/books/files//uploads/books/files/')) {
      correctedPath = correctedPath.replace('/uploads/books/files//uploads/books/files/', '/uploads/books/files/');
      console.log(`🔄 Pattern 3 fixed: ${req.path} -> ${correctedPath}`);
    } else {
      correctedPath = correctedPath.replace(/\/\//g, '/');
      console.log(`🔄 General double slash fixed: ${req.path} -> ${correctedPath}`);
    }
    
    return res.redirect(correctedPath);
  }
  
  next();
};