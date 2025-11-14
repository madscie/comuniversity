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

export const handleDownload = async (fileUrl, fileName = "document") => {
  try {
    const link = document.createElement("a");
    link.href = fileUrl.startsWith("http")
      ? fileUrl
      : `http://localhost:5000${fileUrl}`;
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
  const fullUrl = fileUrl.startsWith("http")
    ? fileUrl
    : `http://localhost:5000${fileUrl}`;
  window.open(fullUrl, "_blank");
};
