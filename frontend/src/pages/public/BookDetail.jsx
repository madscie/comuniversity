import { useEffect, useState } from "react";
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
  FiAlertCircle,
  FiEye,
  FiBarChart2,
  FiAward,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import ReadingModal from "../../components/Reading/ReadingModal";
import { bookService } from "../../services/bookService";
import { readingService } from "../../services/readingService";
import { generateBookContent } from "../../services/bookContentSevice";
import { getImageUrl, handleImageError } from "../../utils/helpers";
import { formatDate } from "../../utils/dateHelper";
import { renderStars } from "../../utils/ratingHelper";
import { handleDownload, handleViewDocument } from "../../utils/fileHelpers";
import { clearCorruptedData } from "../../utils/storageHelpers";
import { formatReadingTime } from "../../utils/dateHelper";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [readingStats, setReadingStats] = useState(null);
  const [readingTimer, setReadingTimer] = useState(null);

  useEffect(() => {
    const loadBookData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📚 Loading book with ID:", id);

        const bookResponse = await bookService.getBookById(id);
        console.log("📖 Book API Response:", bookResponse);

        if (bookResponse && (bookResponse.success || bookResponse.data)) {
          let bookData;
          if (bookResponse.data && bookResponse.data.book) {
            bookData = bookResponse.data.book;
          } else if (bookResponse.data) {
            bookData = bookResponse.data;
          } else {
            bookData = bookResponse;
          }

          if (!bookData) {
            throw new Error("No book data received from server");
          }

          setBook(bookData);
          setIsFavorite(readingService.isFavorite(bookData.id));
          setHasPurchased(readingService.hasPurchased(bookData.id));
          setReadingStats(readingService.getReadingStats(bookData.id));

          if (bookData.category) {
            await loadRelatedBooks(bookData.category, bookData.id);
          }
        } else {
          throw new Error(bookResponse?.message || "Book not found");
        }
      } catch (err) {
        console.error("❌ Error loading book:", err);
        setError(
          err.message || "Failed to load book details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBookData();
    }
  }, [id]);

  const loadRelatedBooks = async (category, currentBookId) => {
    try {
      setLoadingRelated(true);
      const relatedResponse = await bookService.getBooks({
        category,
        limit: 3,
      });

      if (
        relatedResponse &&
        (relatedResponse.success || relatedResponse.data)
      ) {
        let relatedBooksData = [];
        if (relatedResponse.data && relatedResponse.data.books) {
          relatedBooksData = relatedResponse.data.books;
        } else if (relatedResponse.data) {
          relatedBooksData = relatedResponse.data;
        } else {
          relatedBooksData = relatedResponse.books || [];
        }

        setRelatedBooks(
          relatedBooksData
            .filter((b) => b && b.id !== parseInt(currentBookId))
            .slice(0, 3)
        );
      }
    } catch (error) {
      console.error("Error loading related books:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const { chapters, totalPages } = generateBookContent(book);

  const handleReadOnline = () => {
    setIsReading(true);
    setCurrentChapter(0);
    setCurrentPage(0);

    // Start reading timer
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1);
      updateReadingStats();
    }, 60000);

    setReadingTimer(timer);

    // Update last read timestamp
    if (book) {
      readingService.updateReadingStats(book.id, {
        lastRead: new Date().toISOString(),
      });
      setReadingStats(readingService.getReadingStats(book.id));
    }
  };

  const handleCloseReading = () => {
    setIsReading(false);
    if (readingTimer) {
      clearInterval(readingTimer);
      setReadingTimer(null);
    }
  };

  const updateReadingStats = () => {
    if (!book) return;

    const stats = readingService.getReadingStats(book.id);
    const wordsRead = stats.wordsRead + stats.readingSpeed / 2;
    const progress = readingService.getReadingProgress(book.id);
    const pagesRead = Object.values(progress).reduce(
      (total, page) => total + page + 1,
      0
    );

    const newStats = readingService.updateReadingStats(book.id, {
      wordsRead,
      pagesRead,
      totalReadingTime: stats.totalReadingTime + 1,
    });

    setReadingStats(newStats);
  };

  const handleChapterChange = (chapterIndex) => {
    setCurrentChapter(chapterIndex);
    if (book) {
      readingService.updateReadingProgress(book.id, chapterIndex, currentPage);
    }
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex);
    if (book) {
      readingService.updateReadingProgress(book.id, currentChapter, pageIndex);
    }
  };

  const toggleFavorite = () => {
    if (!book) return;
    const newFavoriteStatus = readingService.toggleFavorite(book.id);
    setIsFavorite(newFavoriteStatus);
  };

  const handleDownloadClick = async (format) => {
    if (!book) return;

    try {
      if (format === "PDF" && book.file_url) {
        await handleDownload(book.file_url, `${book.title}.pdf`);
      } else {
        alert(
          `Download functionality for ${format} format will be implemented soon.`
        );
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }
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

  const calculateOverallProgress = () => {
    if (!book) return 0;
    const progress = readingService.getReadingProgress(book.id);
    return readingService.calculateOverallProgress(chapters, progress);
  };

  // Safe book data accessors
  const getBookData = () => ({
    title: book?.title || "Unknown Title",
    author: book?.author || "Unknown Author",
    category: book?.category || "General",
    description: book?.description || "No description available.",
    price: book?.price || 0,
    cover: book?.cover_image,
    dewey: book?.dewey_number || "N/A",
    publisher: book?.publisher || "N/A",
    language: book?.language || "N/A",
    pages: book?.pages || "N/A",
    isbn: book?.isbn || "N/A",
    format: book?.format || "N/A",
    fileSize: book?.file_size || "N/A",
    publishedDate: book?.published_date || "N/A",
    downloads: book?.downloads || 0,
    rating: book?.rating || 0,
  });

  const bookData = getBookData();

  // Render book cover with fallback
  const renderBookCover = () => {
    if (bookData.cover) {
      return (
        <img
          src={getImageUrl(bookData.cover)}
          alt={bookData.title}
          className="w-48 h-60 sm:w-56 sm:h-72 lg:w-64 lg:h-80 object-cover rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
      );
    }

    return (
      <div className="w-48 h-60 sm:w-56 sm:h-72 lg:w-64 lg:h-80 bg-gradient-to-br from-gray-700 to-green-600 rounded-xl shadow-2xl flex items-center justify-center text-white text-6xl">
        <FiBook />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-8">
        <Card className="text-center p-6 sm:p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Loading Book...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load the book details.
          </p>
        </Card>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-8">
        <Card className="text-center p-6 sm:p-8">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {error ? "Error Loading Book" : "Book Not Found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            {error || "The book you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate(-1)}>
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/browse")} variant="secondary">
              Browse Books
            </Button>
            <Button
              onClick={() =>
                clearCorruptedData([
                  "favorites",
                  "purchases",
                  `readingProgress_${id}`,
                  `bookmarks_${id}`,
                  `readingStats_${id}`,
                ])
              }
              variant="outline"
            >
              Clear Corrupted Data
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

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
                {renderBookCover()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:w-2/3 p-4 sm:p-6 lg:p-8">
              <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
                <span className="inline-block px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm font-medium">
                  {bookData.category} • {bookData.dewey}
                </span>
                <span
                  className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    bookData.price > 0
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  }`}
                >
                  {bookData.price > 0
                    ? `Premium - $${bookData.price}`
                    : "Free Access"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                {bookData.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
                by {bookData.author}
              </p>

              {/* Rating and Downloads */}
              <div className="flex items-center mb-4 sm:mb-6 space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(bookData.rating, "h-4 w-4 sm:h-5 sm:w-5")}
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                    {bookData.rating}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  <FiUsers className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  {bookData.downloads.toLocaleString()} downloads
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                {bookData.description}
              </p>

              {/* Reading Progress */}
              {overallProgress > 0 && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Your Progress
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {Math.round(overallProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  {readingStats && (
                    <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mt-2">
                      <span>{readingStats.pagesRead} pages read</span>
                      <span>
                        {formatReadingTime(readingStats.totalReadingTime)} spent
                      </span>
                    </div>
                  )}
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
                  {overallProgress > 0 ? "Continue Reading" : "Read Online"}
                </Button>

                {bookData.price > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadClick("PDF")}
                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                  >
                    <FiDownload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {hasPurchased
                      ? "Download PDF"
                      : `Purchase & Download - $${bookData.price}`}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadClick("PDF")}
                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                    disabled={!book.file_url}
                  >
                    <FiDownload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {book.file_url
                      ? "Download PDF (Free)"
                      : "Download (File Not Available)"}
                  </Button>
                )}

                {book.file_url && (
                  <Button
                    variant="outline"
                    onClick={() => handleViewDocument(book.file_url)}
                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                  >
                    <FiEye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    View PDF
                  </Button>
                )}
              </div>

              {bookData.price > 0 && !hasPurchased && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center">
                    <FiDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-yellow-800 dark:text-yellow-300 font-medium text-sm sm:text-base">
                      This is a premium book. Purchase required for download.
                    </span>
                  </div>
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
                    {formatDate(bookData.publishedDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Publisher:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bookData.publisher}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Pages:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bookData.pages}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Access:
                  </span>
                  <span
                    className={`font-medium ${
                      bookData.price > 0
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {bookData.price > 0
                      ? `$${bookData.price} (Premium)`
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
                    {bookData.isbn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Language:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bookData.language}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    File Size:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bookData.fileSize}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Available Formats:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bookData.format}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md dark:shadow-gray-900/50">
            <div className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <FiBook className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                Reading Statistics
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Progress:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Time Spent:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {readingStats
                      ? formatReadingTime(readingStats.totalReadingTime)
                      : "0m"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Pages Read:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {readingStats?.pagesRead || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Read:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {readingStats?.lastRead
                      ? formatDate(readingStats.lastRead)
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <Card className="border-0 shadow-xl dark:shadow-gray-900/50">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Related Books
              </h2>
              {loadingRelated ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading related books...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {relatedBooks.map((relatedBook) => (
                    <Link
                      key={relatedBook.id}
                      to={`/books/${relatedBook.id}`}
                      className="block group"
                    >
                      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 dark:shadow-gray-900/50">
                        <div className="p-3 sm:p-4">
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            {relatedBook.cover_image ? (
                              <img
                                src={getImageUrl(relatedBook.cover_image)}
                                alt={relatedBook.title}
                                className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded-lg flex-shrink-0"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gradient-to-br from-gray-700 to-green-600 rounded-lg flex items-center justify-center text-white">
                                <FiBook className="h-6 w-6" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-sm sm:text-base line-clamp-2">
                                {relatedBook.title || "Unknown Title"}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                                {relatedBook.author || "Unknown Author"}
                              </p>
                              <div className="flex items-center mt-1 sm:mt-2">
                                {renderStars(
                                  relatedBook.rating || 0,
                                  "h-3 w-3 sm:h-4 sm:w-4"
                                )}
                                <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  {relatedBook.rating || 0}
                                </span>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                  (relatedBook.price || 0) > 0
                                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                                    : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                }`}
                              >
                                {(relatedBook.price || 0) > 0
                                  ? `$${relatedBook.price}`
                                  : "Free"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Reading Modal */}
        <ReadingModal
          book={book}
          chapters={chapters}
          isOpen={isReading}
          onClose={handleCloseReading}
          currentChapter={currentChapter}
          currentPage={currentPage}
          onChapterChange={handleChapterChange}
          onPageChange={handlePageChange}
          readingTime={readingTime}
          readingStats={readingStats}
        />
      </div>
    </div>
  );
};

export default BookDetail;
