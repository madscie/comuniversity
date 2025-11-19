// utils/fileHelpers.js - Updated version
import { API_BASE_URL } from "../config/apiConfig";

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileIcon = (fileType) => {
  if (!fileType) return "📁";
  const type = fileType.toLowerCase();

  if (type.includes("pdf")) return "📕";
  if (type.includes("word") || type.includes("document")) return "📄";
  if (type.includes("text")) return "📝";
  if (type.includes("image")) return "🖼️";
  return "📁";
};

export const getFileTypeName = (fileType) => {
  if (!fileType) return "Document";
  const type = fileType.toLowerCase();

  if (type.includes("pdf")) return "PDF Document";
  if (type.includes("word") || type.includes("document"))
    return "Word Document";
  if (type.includes("text")) return "Text File";
  if (type.includes("rtf")) return "Rich Text File";
  if (type.includes("image")) return "Image File";
  return "Document";
};

// utils/fileHelpers.js - Updated version

export const getFileUrl = (filePath) => {
  if (!filePath) return null;

  console.log("📁 Original file path:", filePath);

  // If it's already a full URL, use it directly
  if (filePath.startsWith("http")) {
    return filePath;
  }

  // Extract filename (your file_url is just a filename like "image-1763572856445-433081217.pdf")
  let filename = filePath;
  if (filePath.includes("/")) {
    filename = filePath.split("/").pop();
  }

  // Your files are likely in the root uploads directory
  const fullUrl = `${API_BASE_URL}/uploads/${filename}`;
  console.log("✅ Final file URL:", fullUrl);

  return fullUrl;
};

export const handleDownload = async (fileUrl, fileName = "document") => {
  try {
    const fullUrl = getFileUrl(fileUrl);
    console.log("⬇️ Downloading from:", fullUrl);

    const link = document.createElement("a");
    link.href = fullUrl;
    link.target = "_blank";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Download error:", error);
    throw new Error("Failed to download file");
  }
};

export const handleViewDocument = (fileUrl) => {
  const fullUrl = getFileUrl(fileUrl);
  console.log("👀 Viewing document:", fullUrl);
  window.open(fullUrl, "_blank");
};
