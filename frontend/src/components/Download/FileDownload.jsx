// components/Download/FileDownload.jsx
import React, { useState, useEffect } from "react";
import { FiDownload, FiCheck, FiAlertCircle } from "react-icons/fi";
import { getBookById } from "../../data/BookData"; // Import to get actual book content

const FileDownload = ({
  downloadData,
  bookTitle,
  bookAuthor,
  format,
  onDownloadComplete,
  onBack,
}) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("preparing");
  const [bookContent, setBookContent] = useState("");

  // Get actual book content from your booksData
  useEffect(() => {
    if (downloadData?.bookId) {
      const book = getBookById(downloadData.bookId);
      if (book && book.content) {
        setBookContent(book.content);
      } else {
        // Fallback content if no book content found
        setBookContent(`
          ${bookTitle}
          by ${bookAuthor}
          
          This is your purchased copy of "${bookTitle}" in ${format} format.
          
          Thank you for your purchase!
          
          Download Date: ${new Date().toLocaleDateString()}
          Format: ${format}
          File Size: ${format === "PDF" ? "45.2 MB" : "38.7 MB"}
        `);
      }
    }
  }, [downloadData, bookTitle, bookAuthor, format]);

  // Function to create and download actual file with proper content
  const createAndDownloadFile = () => {
    try {
      console.log("Creating download file...", {
        bookTitle,
        format,
        contentLength: bookContent.length,
      });

      let fileContent = "";
      let mimeType = "";
      let fileExtension = "";

      // Use actual book content from your database
      if (bookContent) {
        fileContent = bookContent;
      } else {
        // Fallback content
        fileContent = `
BOOK: ${bookTitle}
AUTHOR: ${bookAuthor}
FORMAT: ${format}
DOWNLOAD DATE: ${new Date().toLocaleDateString()}

CONTENT:

Chapter 1: Introduction

Welcome to "${bookTitle}" by ${bookAuthor}.

This is your purchased copy of the book in ${format} format.

In a complete implementation, this would contain the full book content
from your database including all chapters, images, and formatting.

Table of Contents:
- Chapter 1: Introduction
- Chapter 2: Core Concepts  
- Chapter 3: Advanced Topics
- Chapter 4: Practical Examples
- Chapter 5: Conclusion

Thank you for your purchase!

---
This is a functional download demonstration.
File: ${bookTitle
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}.${format.toLowerCase()}
Size: ${format === "PDF" ? "45.2" : "38.7"} MB
        `;
      }

      // Set proper MIME types and extensions
      if (format === "PDF") {
        mimeType = "application/pdf";
        fileExtension = "pdf";
        // For PDF, we can create a text file that represents a PDF
        // In a real app, you'd serve actual PDF files from your server
        fileContent = `PDF-1.4\n%${bookTitle}\n\n${fileContent}`;
      } else if (format === "EPUB") {
        mimeType = "application/epub+zip";
        fileExtension = "epub";
        // EPUB is basically a ZIP file with specific structure
        // For demo, we'll create a text representation
        fileContent = `EPUB-3.0\n${bookTitle}\n\n${fileContent}`;
      } else {
        // Default to text file
        mimeType = "text/plain";
        fileExtension = "txt";
      }

      // Create Blob with proper encoding
      const blob = new Blob([fileContent], {
        type: `${mimeType};charset=utf-8`,
      });

      console.log("Blob created:", {
        size: blob.size,
        type: blob.type,
      });

      // Create download URL
      const url = URL.createObjectURL(blob);

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${bookTitle
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.${fileExtension}`;
      link.download = fileName;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log("Download triggered for:", fileName);
      return true;
    } catch (error) {
      console.error("Download error:", error);
      return false;
    }
  };

  useEffect(() => {
    const startDownload = async () => {
      setDownloadStatus("preparing");

      // Wait a bit for content to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      setDownloadStatus("downloading");

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 8;
        });
      }, 150);

      // Wait then trigger actual download
      setTimeout(async () => {
        try {
          clearInterval(progressInterval);

          // Perform actual download
          const downloadSuccess = createAndDownloadFile();

          if (downloadSuccess) {
            // Complete progress
            setDownloadProgress(100);
            setDownloadStatus("complete");

            // Save to user's library
            saveToUserLibrary();

            // Notify completion after short delay
            setTimeout(() => {
              onDownloadComplete();
            }, 1500);
          } else {
            setDownloadStatus("error");
          }
        } catch (error) {
          console.error("Download process error:", error);
          setDownloadStatus("error");
        }
      }, 2000);
    };

    if (bookContent || downloadData) {
      startDownload();
    }
  }, [
    bookContent,
    downloadData,
    bookTitle,
    bookAuthor,
    format,
    onDownloadComplete,
  ]);

  const saveToUserLibrary = () => {
    try {
      const userLibrary = JSON.parse(
        localStorage.getItem("userLibrary") || "[]"
      );

      const purchaseRecord = {
        id: Math.random().toString(36).substr(2, 9),
        bookId: downloadData?.bookId || "mock_id",
        title: bookTitle,
        author: bookAuthor,
        format: format,
        downloadDate: new Date().toISOString(),
        fileSize: format === "PDF" ? "45.2 MB" : "38.7 MB",
        lastAccessed: new Date().toISOString(),
        downloadUrl: "#",
        coverImage: downloadData?.coverImage || "/default-cover.jpg",
        transactionId: downloadData?.transactionId,
      };

      // Check if already in library to avoid duplicates
      const alreadyExists = userLibrary.some(
        (item) =>
          item.bookId === purchaseRecord.bookId && item.format === format
      );

      if (!alreadyExists) {
        userLibrary.push(purchaseRecord);
        localStorage.setItem("userLibrary", JSON.stringify(userLibrary));
        console.log("Book saved to library:", purchaseRecord);
      }
    } catch (error) {
      console.error("Error saving to library:", error);
    }
  };

  const handleManualDownload = () => {
    const success = createAndDownloadFile();
    if (!success) {
      alert("Download failed. Please try again.");
    }
  };

  const getStatusMessage = () => {
    switch (downloadStatus) {
      case "preparing":
        return "Preparing your download...";
      case "downloading":
        return `Downloading "${bookTitle}" in ${format} format...`;
      case "complete":
        return "Download complete!";
      case "error":
        return "Download failed. Please try again.";
      default:
        return "Starting download...";
    }
  };

  const getStatusIcon = () => {
    switch (downloadStatus) {
      case "preparing":
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        );
      case "downloading":
        return <FiDownload className="h-6 w-6 text-blue-600 animate-bounce" />;
      case "complete":
        return <FiCheck className="h-6 w-6 text-green-600" />;
      case "error":
        return <FiAlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <FiDownload className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        {getStatusIcon()}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {getStatusMessage()}
      </h3>

      {/* Progress Bar */}
      {(downloadStatus === "downloading" || downloadStatus === "preparing") && (
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 mx-auto max-w-md">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${downloadProgress}%` }}
          ></div>
          <div className="text-xs text-gray-600 mt-1">
            {downloadProgress}% complete
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-4">
        {downloadStatus === "preparing" &&
          "Loading book content and preparing file..."}
        {downloadStatus === "downloading" && "Your book is being downloaded..."}
        {downloadStatus === "complete" &&
          "Your book has been downloaded and added to your library!"}
        {downloadStatus === "error" &&
          "There was an error downloading your book."}
      </p>

      {/* Download Details */}
      <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto text-left mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">Download Details</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Book:</span>
            <span className="font-medium">{bookTitle}</span>
          </div>
          <div className="flex justify-between">
            <span>Author:</span>
            <span className="font-medium">{bookAuthor}</span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span className="font-medium">{format}</span>
          </div>
          <div className="flex justify-between">
            <span>File Size:</span>
            <span className="font-medium">
              ~{format === "PDF" ? "45.2" : "38.7"} MB
            </span>
          </div>
          <div className="flex justify-between">
            <span>File Name:</span>
            <span className="font-medium text-xs truncate">
              {bookTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.
              {format.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {downloadStatus === "complete" && (
        <div className="space-y-3">
          <button
            onClick={handleManualDownload}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
          >
            <FiDownload className="mr-2" />
            Download Again
          </button>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">
              ✅ <strong>Success!</strong> Your book has been downloaded and
              saved to your library. You can access it anytime from "My
              Library".
            </p>
          </div>
        </div>
      )}

      {downloadStatus === "error" && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">
              ❌ Download failed. Please try again or contact support if the
              problem continues.
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default FileDownload;
