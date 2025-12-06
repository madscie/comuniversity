// src/utils/fileHelpers.js - COMPLETE FIXED VERSION
const API_BASE_URL = "http://localhost:5000";

// ===== FILE HANDLING FUNCTIONS =====

// Function to view document (PDF, etc.)
export const handleViewDocument = (fileUrl) => {
  if (!fileUrl) {
    alert("Document not available");
    return;
  }

  // Get the full URL using getFileUrl helper
  const fullUrl = getFileUrl(fileUrl);
  
  console.log("Opening document:", fullUrl);
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
};

// Function to download document
export const handleDownload = async (fileUrl, fileName) => {
  if (!fileUrl) {
    alert("File not available for download");
    return;
  }

  try {
    // Get the full URL using getFileUrl helper
    const fullUrl = getFileUrl(fileUrl);

    console.log("Downloading:", fullUrl);

    // Simple download method
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = fileName || fileUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Download error:", error);
    alert("Download failed. Please try again.");
    return false;
  }
};

// Format file size (bytes to KB/MB/GB)
export const formatFileSize = (bytes) => {
  if (bytes === 0 || !bytes) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type display name (alias for getFileTypeDisplay)
export const getFileTypeName = (filename) => {
  const ext = getFileExtension(filename);
  const types = {
    pdf: 'PDF Document',
    doc: 'Word Document',
    docx: 'Word Document',
    txt: 'Text File',
    epub: 'eBook',
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
    png: 'PNG Image',
    mp4: 'MP4 Video',
    mp3: 'MP3 Audio',
    default: 'File'
  };
  return types[ext] || types.default;
};

// Get file type display name (same as getFileTypeName)
export const getFileTypeDisplay = getFileTypeName;

// Helper to check if file exists
export const checkFileExists = async (fileUrl) => {
  if (!fileUrl) return false;

  try {
    const fullUrl = getFileUrl(fileUrl);
    const response = await fetch(fullUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error("File check error:", error);
    return false;
  }
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || '';
};

// Get file type icon
export const getFileIcon = (filename) => {
  const ext = getFileExtension(filename);
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📄',
    epub: '📚',
    jpg: '🖼️',
    png: '🖼️',
    jpeg: '🖼️',
    mp4: '🎬',
    mp3: '🎵',
    default: '📁'
  };
  return icons[ext] || icons.default;
};

// Get MIME type from extension
export const getMimeType = (filename) => {
  const ext = getFileExtension(filename);
  const mimeTypes = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    epub: 'application/epub+zip',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    default: 'application/octet-stream'
  };
  return mimeTypes[ext] || mimeTypes.default;
};

// Check if file is an image
export const isImageFile = (filename) => {
  const ext = getFileExtension(filename);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  return imageExtensions.includes(ext);
};

// Check if file is a document
export const isDocumentFile = (filename) => {
  const ext = getFileExtension(filename);
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  return documentExtensions.includes(ext);
};

// Check if file is a video
export const isVideoFile = (filename) => {
  const ext = getFileExtension(filename);
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
  return videoExtensions.includes(ext);
};

// Check if file is audio
export const isAudioFile = (filename) => {
  const ext = getFileExtension(filename);
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
  return audioExtensions.includes(ext);
};

// Check if file is an archive
export const isArchiveFile = (filename) => {
  const ext = getFileExtension(filename);
  const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
  return archiveExtensions.includes(ext);
};

// Extract filename from URL
export const extractFileName = (url) => {
  if (!url) return 'Unknown File';
  const filename = url.split('/').pop() || 'Unknown File';
  // Remove query parameters if any
  return filename.split('?')[0];
};

// Generate download URL with proper headers
export const generateDownloadUrl = (fileUrl) => {
  if (!fileUrl) return null;
  return getFileUrl(fileUrl);
};

// Sanitize filename for download
export const sanitizeFilename = (filename) => {
  if (!filename) return 'download';
  // Remove special characters and spaces
  return filename
    .replace(/[^\w\s.-]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
};

// Get file category
export const getFileCategory = (filename) => {
  if (isImageFile(filename)) return 'image';
  if (isDocumentFile(filename)) return 'document';
  if (isVideoFile(filename)) return 'video';
  if (isAudioFile(filename)) return 'audio';
  if (isArchiveFile(filename)) return 'archive';
  return 'other';
};

// Get appropriate viewer component type
export const getViewerType = (filename) => {
  const ext = getFileExtension(filename);

  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (['txt', 'md'].includes(ext)) return 'text';

  return 'download'; // For unsupported types, offer download only
};

// Get human readable file type
export const getHumanFileType = (filename) => {
  const category = getFileCategory(filename);
  const types = {
    image: 'Image',
    document: 'Document',
    video: 'Video',
    audio: 'Audio',
    archive: 'Archive',
    other: 'File'
  };
  return types[category] || types.other;
};

// ===== IMAGE & FILE URL HELPERS =====
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === "null" || imagePath === "undefined") {
    console.log("❌ getImageUrl: No image path provided");
    return null;
  }
  
  console.log("🔍 getImageUrl called with:", imagePath);

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // If it starts with /uploads, it's already a full path
  if (imagePath.startsWith("/uploads")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // ===== FIX: Handle different file patterns =====
  
  // NEW article images (saved in articles/images/)
  if (imagePath.includes("article-image-")) {
    const url = `${API_BASE_URL}/uploads/articles/images/${imagePath}`;
    console.log("📄 NEW Article image URL:", url);
    return url;
  }
  
  // NEW book images (saved in images/)
  if (imagePath.includes("book-image-") || imagePath.includes("image-17647")) {
    const url = `${API_BASE_URL}/uploads/images/${imagePath}`;
    console.log("📚 Book image URL:", url);
    return url;
  }
  
  // OLD article images (saved in root uploads/)
  // These are your old files like "image-1761925560657-131828645.jpg"
  if (imagePath.startsWith("image-176")) {
    // Try articles/images first
    const articleUrl = `${API_BASE_URL}/uploads/articles/images/${imagePath}`;
    // Try root uploads as fallback
    const rootUrl = `${API_BASE_URL}/uploads/${imagePath}`;
    
    console.log("🔄 OLD Article image - Trying:", articleUrl);
    console.log("🔄 OLD Article image - Fallback:", rootUrl);
    
    // Return the articles/images path (new structure)
    return articleUrl;
  }
  
  // If we can't figure it out, try the most common location
  console.log("🤔 Unknown image pattern, defaulting to articles/images");
  return `${API_BASE_URL}/uploads/articles/images/${imagePath}`;
};

export const getFileUrl = (filePath) => {
  if (!filePath || filePath === "null" || filePath === "undefined") {
    console.log("❌ getFileUrl: No file path provided");
    return null;
  }
  
  console.log("🔍 getFileUrl called with:", filePath);

  if (filePath.startsWith("http")) {
    return filePath;
  }
  
  if (filePath.startsWith("/uploads")) {
    return `${API_BASE_URL}${filePath}`;
  }
  
  // For NEW article files (saved in articles/files/)
  if (filePath.includes("article-file-") || filePath.includes("article")) {
    const url = `${API_BASE_URL}/uploads/articles/files/${filePath}`;
    console.log("📄 Article file URL:", url);
    return url;
  }
  
  // For NEW book files (saved in files/)
  if (filePath.includes("book-file-") || filePath.includes("book")) {
    const url = `${API_BASE_URL}/uploads/files/${filePath}`;
    console.log("📚 Book file URL:", url);
    return url;
  }
  
  // For OLD files that might be in root uploads
  if (filePath.includes("file-176") || filePath.includes("uploads/files/")) {
    // Remove the "uploads/files/" prefix if it exists
    const cleanPath = filePath.replace("uploads/files/", "");
    const url = `${API_BASE_URL}/uploads/files/${cleanPath}`;
    console.log("📝 Old file pattern URL:", url);
    return url;
  }
  
  // Default to articles/files for new uploads
  console.log("📝 Defaulting to article file URL");
  return `${API_BASE_URL}/uploads/articles/files/${filePath}`;
};

export const handleImageError = (e) => {
  console.error("Image failed to load:", e.target.src);
  e.target.style.display = "none";
  
  const parent = e.target.parentElement;
  if (parent && !parent.querySelector(".image-fallback")) {
    const fallback = document.createElement("div");
    fallback.className = "image-fallback w-full h-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 flex items-center justify-center";
    
    const icon = document.createElement("div");
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>';
    
    fallback.appendChild(icon);
    parent.appendChild(fallback);
  }
};

// ===== DATE FORMATTING =====
export const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ===== VALIDATION FUNCTIONS =====
export const validateDeweyDecimal = (dewey) => {
  if (!dewey || dewey.trim() === '') return true; // Optional field
  
  // Dewey Decimal format: 3 digits, optional decimal point, more digits
  const deweyRegex = /^\d{3}(\.\d+)?$/;
  return deweyRegex.test(dewey);
};

export const validateISBN = (isbn) => {
  if (!isbn || isbn.trim() === '') return true; // Optional field
  
  // Basic ISBN validation (10 or 13 digits, with optional hyphens)
  const isbnRegex = /^(?:\d{9}[\dX]|\d{13})$/;
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  return isbnRegex.test(cleanISBN);
};

// ===== ARTICLE ACCESS CHECK =====
export const checkArticleAccess = async (articleId, userId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}/check-access`);
    const data = await response.json();
    
    if (data.success) {
      return data.data.article.has_access;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking article access:", error);
    return false;
  }
};

// ===== ADDITIONAL CONVENIENCE FUNCTIONS =====

// Check if a file is viewable in browser
export const isViewableInBrowser = (filename) => {
  const ext = getFileExtension(filename);
  const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'md'];
  return viewableExtensions.includes(ext);
};

// Get file preview URL (for images and PDFs)
export const getFilePreviewUrl = (fileUrl) => {
  if (!fileUrl) return null;
  
  // For images and PDFs, return the URL as is for preview
  if (isViewableInBrowser(fileUrl)) {
    return getFileUrl(fileUrl);
  }
  
  return null;
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return "Unknown date/time";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};