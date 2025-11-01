// src/pages/public/BookDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBook,
  FiDownload,
  FiHeart,
  FiShare2,
  FiStar,
  FiUsers,
  FiCalendar,
  FiGlobe,
  FiBookOpen,
  FiDollarSign,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

// Import centralized book data and helper functions
import {
  booksData,
  getBookById,
  isBookPaidContent,
  getFreeBooks,
  getPaidBooks,
} from "../../data/BookData";

// Import download utilities
import {
  handleBookDownload,
  hasUserPurchasedBook,
} from "../../utils/HandleBookDownload";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showDownloadFlow, setShowDownloadFlow] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("");

  useEffect(() => {
    const loadBookData = () => {
      // Use centralized book data
      const foundBook = getBookById(parseInt(id));

      if (foundBook) {
        setBook(foundBook);

        // Check purchase status
        const purchased = hasUserPurchasedBook(id);
        setHasPurchased(purchased);

        // Check favorites
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorite(favorites.includes(foundBook.id));
      }
    };

    if (id) {
      loadBookData();
    }
  }, [id]);

  const handleReadOnline = () => {
    setIsReading(true);
    setCurrentPage(0);
  };

  const handleDownload = async (format) => {
    if (!book) return;

    // Check purchase status for paid books USING HELPER FUNCTION
    if (isBookPaidContent(book) && !hasPurchased) {
      const confirmPurchase = window.confirm(
        `You need to purchase "${book.title}" to download it. Would you like to buy it now for $${book.price}?`
      );
      if (confirmPurchase) {
        navigate(`/checkout/${book.id}`);
      }
      return;
    }

    // Handle download
    try {
      await handleBookDownload(book, format);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const toggleFavorite = () => {
    if (!book) return;

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const newFavorites = favorites.filter((favId) => favId !== book.id);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    } else {
      favorites.push(book.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (!book) return;

    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownloadComplete = () => {
    setShowDownloadFlow(false);
    setSelectedFormat("");
  };

  const handleDownloadCancel = () => {
    setShowDownloadFlow(false);
    setSelectedFormat("");
  };

  // Temporary debug function to simulate purchase for testing
  const simulatePurchase = () => {
    const purchases = JSON.parse(localStorage.getItem("purchases") || "{}");
    purchases[id] = true;
    localStorage.setItem("purchases", JSON.stringify(purchases));
    setHasPurchased(true);
    alert("Purchase simulated for testing! You can now download the book.");
  };

  const pages = book?.content ? book.content.split("\n\n") : [];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 sm:h-5 sm:w-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-8">
        <Card className="text-center p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Book Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            The book you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/browse")}>
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-4 sm:py-6 lg:py-8 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              onClick={toggleFavorite}
              className={`flex items-center text-sm sm:text-base ${
                isFavorite ? "text-red-600" : "text-gray-600 dark:text-gray-400"
              } hover:text-red-700 dark:hover:text-red-400`}
            >
              <FiHeart
                className={`mr-1 sm:mr-2 h-4 w-4 ${
                  isFavorite ? "fill-current" : ""
                }`}
              />
              <span className="hidden xs:inline">
                {isFavorite ? "Favorited" : "Favorite"}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm sm:text-base"
            >
              <FiShare2 className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Book Header */}
        <Card className="mb-6 sm:mb-8 lg:mb-12 border-0 shadow-xl dark:shadow-gray-900/50">
          <div className="flex flex-col lg:flex-row">
            {/* Book Cover */}
            <div className="lg:w-1/3 p-4 sm:p-6 lg:p-8 flex justify-center">
              <div className="relative group">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-48 h-60 sm:w-56 sm:h-72 lg:w-64 lg:h-80 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:w-2/3 p-4 sm:p-6 lg:p-8">
              <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
                <span className="inline-block px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm font-medium">
                  {book.category} • {book.deweyNumber || book.ddc || "N/A"}
                </span>
                {/* Payment Status Badge */}
                <span
                  className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    isBookPaidContent(book)
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  }`}
                >
                  {isBookPaidContent(book)
                    ? `Premium - $${book.price}`
                    : "Free Access"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                {book.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
                by {book.author}
              </p>

              {/* Rating and Downloads */}
              <div className="flex items-center mb-4 sm:mb-6 space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(book.rating || 0)}
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                    {book.rating || 0}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  <FiUsers className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  {book.downloads?.toLocaleString() || 0} downloads
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                {book.description}
              </p>

              {/* Purchase Status */}
              {hasPurchased && isBookPaidContent(book) && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 font-medium text-sm sm:text-base">
                    ✓ You own this book - Ready to download!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Button
                  variant="primary"
                  onClick={handleReadOnline}
                  className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <FiBookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Read Online
                </Button>

                {/* Download Buttons */}
                {isBookPaidContent(book) ? (
                  <>
                    {hasPurchased ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleDownload("PDF")}
                          className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                        >
                          <FiDownload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Download PDF
                        </Button>
                        {(book.format || "").includes("EPUB") && (
                          <Button
                            variant="outline"
                            onClick={() => handleDownload("EPUB")}
                            className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                          >
                            <FiBook className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            Download EPUB
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="success"
                        onClick={() => navigate(`/checkout/${book.id}`)}
                        className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                      >
                        <FiDollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Purchase - ${book.price}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload("PDF")}
                      className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                    >
                      <FiDownload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Download PDF (Free)
                    </Button>
                    {(book.format || "").includes("EPUB") && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownload("EPUB")}
                        className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                      >
                        <FiBook className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Download EPUB (Free)
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Access information */}
              {isBookPaidContent(book) && !hasPurchased && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center">
                    <FiDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-yellow-800 dark:text-yellow-300 font-medium text-sm sm:text-base">
                      This is a premium book. Purchase required for download.
                    </span>
                  </div>
                </div>
              )}

              {/* Debug button for testing purchases - REMOVE IN PRODUCTION */}
              {process.env.NODE_ENV === "development" &&
                isBookPaidContent(book) &&
                !hasPurchased && (
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm mb-2">
                      [DEV] Test purchase flow:
                    </p>
                    <Button
                      variant="outline"
                      onClick={simulatePurchase}
                      className="text-xs py-1"
                    >
                      Simulate Purchase for Testing
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </Card>

        {/* Book Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-0 shadow-md dark:shadow-gray-900/50">
            <div className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <FiCalendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                Publication Details
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Published:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {book.publishedDate || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Publisher:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {book.publisher || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Pages:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {book.pages || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Access:
                  </span>
                  <span
                    className={`font-medium ${
                      isBookPaidContent(book)
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {isBookPaidContent(book)
                      ? `$${book.price} (Premium)`
                      : "Free"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md dark:shadow-gray-900/50">
            <div className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <FiGlobe className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                Technical Information
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    ISBN:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {book.isbn || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Language:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {book.language || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    File Size:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {book.fileSize || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Available Formats:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {book.format || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md dark:shadow-gray-900/50">
            <div className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <FiBook className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                Categories & Tags
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {(book.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm"
                  >
                    {tag}
                  </span>
                ))}
                {(!book.tags || book.tags.length === 0) && (
                  <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    No tags available
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Related Books */}
        <Card className="border-0 shadow-xl dark:shadow-gray-900/50">
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Related Books
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {booksData
                .filter((b) => b.id !== book.id && b.category === book.category)
                .slice(0, 3)
                .map((relatedBook) => (
                  <Link
                    key={relatedBook.id}
                    to={`/books/${relatedBook.id}`}
                    className="block group"
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 dark:shadow-gray-900/50">
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <img
                            src={relatedBook.coverImage}
                            alt={relatedBook.title}
                            className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-sm sm:text-base line-clamp-2">
                              {relatedBook.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                              {relatedBook.author}
                            </p>
                            <div className="flex items-center mt-1 sm:mt-2">
                              {renderStars(relatedBook.rating || 0)}
                              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {relatedBook.rating || 0}
                              </span>
                            </div>
                            {/* Payment status for related books */}
                            <span
                              className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                isBookPaidContent(relatedBook)
                                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              }`}
                            >
                              {isBookPaidContent(relatedBook)
                                ? `$${relatedBook.price}`
                                : "Free"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              {booksData.filter(
                (b) => b.id !== book.id && b.category === book.category
              ).length === 0 && (
                <div className="col-span-3 text-center py-4 text-gray-500 dark:text-gray-400">
                  No related books found in the same category.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Reading Modal */}
      {isReading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                Reading: {book.title}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setIsReading(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Close
              </Button>
            </div>

            <div className="p-4 sm:p-6 h-64 sm:h-80 lg:h-96 overflow-y-auto">
              <div className="prose max-w-none text-base sm:text-lg leading-relaxed text-gray-900 dark:text-gray-100">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  Page {currentPage + 1} of {pages.length}
                </h3>
                <div className="whitespace-pre-wrap">
                  {pages[currentPage] || "No content available."}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="text-xs sm:text-sm"
              >
                Previous Page
              </Button>

              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {currentPage + 1} / {pages.length}
              </span>

              <Button
                variant="primary"
                onClick={() =>
                  setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
                }
                disabled={currentPage === pages.length - 1}
                className="text-xs sm:text-sm"
              >
                Next Page
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Download Flow Modal */}
      {showDownloadFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                Purchase & Download
              </h2>
              <Button
                variant="ghost"
                onClick={handleDownloadCancel}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Close
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                {/* Book Summary */}
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      by {book.author}
                    </p>
                    <p className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">
                      ${book.price} • {selectedFormat} format
                    </p>
                  </div>
                </div>

                {/* Download Handler */}
                <div className="text-center p-4 sm:p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                    Download functionality would be implemented here.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleDownloadComplete}
                    className="text-sm sm:text-base"
                  >
                    Complete Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
