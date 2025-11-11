// src/utils/downloadUtils.js

/**
 * Handles book download functionality
 * @param {Object} purchase - The purchase object from user's library
 */
export const handleBookDownload = async (purchase) => {
  try {
    console.log(`Starting download: ${purchase.title}`);

    // Create realistic file content based on book data
    const fileContent = `
TITLE: ${purchase.title}
AUTHOR: ${purchase.author}
PURCHASE DATE: ${new Date(purchase.purchaseDate).toLocaleDateString()}
FORMAT: ${purchase.format || "PDF"}

--- BOOK CONTENT ---

This is a sample content from "${purchase.title}".

Chapter 1: Introduction

Welcome to "${purchase.title}" by ${
      purchase.author
    }. This book contains valuable insights and knowledge in its field.

In a real application, this would be the actual book content fetched from your server or database.

Thank you for your purchase!

--- END OF SAMPLE CONTENT ---

This is a demonstration download. In a production environment, this would be the complete book file.

File generated on: ${new Date().toLocaleDateString()}
    `;

    // Determine file type based on format
    let fileType, fileExtension;
    switch ((purchase.format || "PDF").toLowerCase()) {
      case "epub":
        fileType = "application/epub+zip";
        fileExtension = "epub";
        break;
      case "mobi":
        fileType = "application/x-mobipocket-ebook";
        fileExtension = "mobi";
        break;
      default: // PDF
        fileType = "application/pdf";
        fileExtension = "pdf";
    }

    // Create blob and download link
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${purchase.title.replace(
      /[^a-z0-9]/gi,
      "_"
    )}.${fileExtension}`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Track download in history
    const downloads = JSON.parse(
      localStorage.getItem("downloadHistory") || "[]"
    );
    downloads.unshift({
      id: Math.random().toString(36).substr(2, 9),
      bookId: purchase.bookId,
      title: purchase.title,
      author: purchase.author,
      downloadedAt: new Date().toISOString(),
      format: purchase.format || "PDF",
    });

    // Keep only last 50 downloads
    if (downloads.length > 50) {
      downloads.splice(50);
    }

    localStorage.setItem("downloadHistory", JSON.stringify(downloads));

    // Show success message
    alert(`✅ Download started: "${purchase.title}.${fileExtension}"`);

    return { success: true, message: "Download completed successfully" };
  } catch (error) {
    console.error("Download failed:", error);
    alert("❌ Download failed. Please try again.");
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has purchased a book
 * @param {string|number} bookId - The book ID to check
 * @returns {boolean} - Whether the book is purchased
 */
export const hasUserPurchasedBook = (bookId) => {
  try {
    const userLibrary = JSON.parse(localStorage.getItem("userLibrary") || "[]");
    return userLibrary.some((purchase) => purchase.bookId == bookId);
  } catch (error) {
    console.error("Error checking purchase status:", error);
    return false;
  }
};

/**
 * Get user's purchase for a specific book
 * @param {string|number} bookId - The book ID
 * @returns {Object|null} - Purchase object or null
 */
export const getUserPurchase = (bookId) => {
  try {
    const userLibrary = JSON.parse(localStorage.getItem("userLibrary") || "[]");
    return userLibrary.find((purchase) => purchase.bookId == bookId) || null;
  } catch (error) {
    console.error("Error getting user purchase:", error);
    return null;
  }
};
