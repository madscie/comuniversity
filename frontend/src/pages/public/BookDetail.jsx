// pages/public/BookDetail.jsx
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

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showDownloadFlow, setShowDownloadFlow] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [relatedBooks, setRelatedBooks] = useState([]);

  useEffect(() => {
    const loadBookData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with actual API calls
        // const bookResponse = await bookAPI.getById(id);
        // const relatedResponse = await bookAPI.getRelatedBooks(id, bookResponse.data.category);
        
        // For now, set empty until backend is ready
        setBook(null);
        setRelatedBooks([]);
        
      } catch (err) {
        console.error("Error loading book:", err);
        setError("Failed to load book details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBookData();
    }
  }, [id]);

  const handleReadOnline = () => {
    if (!book?.content) {
      alert("Book content not available yet.");
      return;
    }
    setIsReading(true);
    setCurrentPage(0);
  };

  const handleDownload = async (format) => {
    if (!book) return;

    try {
      // TODO: Replace with actual API call
      // const response = await downloadAPI.downloadBook(book.id, format);
      // Handle the download response (blob, redirect, etc.)
      
      console.log(`Downloading ${book.title} in ${format} format`);
      // Temporary implementation
      alert(`Download functionality for ${format} format will be implemented with backend integration.`);
      
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }
  };

  const handlePurchase = () => {
    if (!book) return;
    
    // TODO: Replace with actual purchase flow
    // navigate(`/checkout/${book.id}`);
    
    console.log("Initiating purchase for:", book.id);
    alert("Purchase flow will be implemented with backend integration.");
  };

  const toggleFavorite = async () => {
    if (!book) return;

    try {
      // TODO: Replace with actual API call
      // if (isFavorite) {
      //   await favoritesAPI.remove(book.id);
      // } else {
      //   await favoritesAPI.add(book.id);
      // }
      
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);
      
      // Temporary local storage for UI feedback
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (newFavoriteStatus) {
        favorites.push(book.id);
      } else {
        const index = favorites.indexOf(book.id);
        if (index > -1) {
          favorites.splice(index, 1);
        }
      }
      localStorage.setItem("favorites", JSON.stringify(favorites));
      
    } catch (err) {
      console.error("Failed to update favorites:", err);
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

  const handleDownloadComplete = () => {
    setShowDownloadFlow(false);
    setSelectedFormat("");
  };

  const handleDownloadCancel = () => {
    setShowDownloadFlow(false);
    setSelectedFormat("");
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Book...</h2>
          <p className="text-gray-600">Please wait while we load the book details.</p>
        </Card>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? "Error Loading Book" : "Book Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The book you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate("/browse")}>
            <FiArrowLeft className="mr-2" />
            Back to Browse
          </Button>
        </Card>
      </div>
    );
  }

  const pages = book.content ? book.content.split("\n\n") : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={toggleFavorite}
              className={`flex items-center ${
                isFavorite ? "text-red-600" : "text-gray-600"
              }`}
            >
              <FiHeart
                className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
              />
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              className="flex items-center text-gray-600"
            >
              <FiShare2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Book Header */}
        <Card className="mb-8 border-0 shadow-xl">
          <div className="flex flex-col lg:flex-row">
            {/* Book Cover */}
            <div className="lg:w-1/3 p-8 flex justify-center">
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-64 h-80 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:w-2/3 p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {book.category} • {book.deweyNumber || book.ddc || "N/A"}
                </span>
                {/* Payment Status Badge */}
                <span
                  className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    book.price > 0
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {book.price > 0
                    ? `Premium - $${book.price}`
                    : "Free Access"}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {book.title}
              </h1>
              <p className="text-xl text-gray-700 mb-6">by {book.author}</p>

              {/* Rating and Downloads */}
              <div className="flex items-center mb-6 space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(book.rating || 0)}
                  <span className="ml-2 text-gray-700 font-medium">
                    {book.rating || 0}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiUsers className="mr-1 h-4 w-4" />
                  {book.downloads?.toLocaleString() || 0} downloads
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {book.description}
              </p>

              {/* Purchase Status */}
              {hasPurchased && book.price > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">
                    ✓ You own this book - Ready to download!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  variant="primary"
                  onClick={handleReadOnline}
                  className="flex items-center px-6 py-3"
                  disabled={!book.content}
                >
                  <FiBookOpen className="mr-2 h-5 w-5" />
                  {book.content ? "Read Online" : "Read Online (Coming Soon)"}
                </Button>

                {/* Download Buttons */}
                {book.price > 0 ? (
                  <>
                    {hasPurchased ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleDownload("PDF")}
                          className="flex items-center px-6 py-3"
                        >
                          <FiDownload className="mr-2 h-5 w-5" />
                          Download PDF
                        </Button>
                        {(book.format || "").includes("EPUB") && (
                          <Button
                            variant="outline"
                            onClick={() => handleDownload("EPUB")}
                            className="flex items-center px-6 py-3"
                          >
                            <FiBook className="mr-2 h-5 w-5" />
                            Download EPUB
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={handlePurchase}
                        className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700"
                      >
                        <FiDollarSign className="mr-2 h-5 w-5" />
                        Purchase - ${book.price}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload("PDF")}
                      className="flex items-center px-6 py-3"
                    >
                      <FiDownload className="mr-2 h-5 w-5" />
                      Download PDF (Free)
                    </Button>
                    {(book.format || "").includes("EPUB") && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownload("EPUB")}
                        className="flex items-center px-6 py-3"
                      >
                        <FiBook className="mr-2 h-5 w-5" />
                        Download EPUB (Free)
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Access information */}
              {book.price > 0 && !hasPurchased && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiDollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">
                      This is a premium book. Purchase required for download.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Book Details Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiCalendar className="mr-2 h-5 w-5 text-blue-600" />
                Publication Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-medium">
                    {book.publishedDate || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Publisher:</span>
                  <span className="font-medium">{book.publisher || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{book.pages || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Access:</span>
                  <span
                    className={`font-medium ${
                      book.price > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {book.price > 0 ? `$${book.price} (Premium)` : "Free"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiGlobe className="mr-2 h-5 w-5 text-green-600" />
                Technical Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ISBN:</span>
                  <span className="font-medium">{book.isbn || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{book.language || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="font-medium">{book.fileSize || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Formats:</span>
                  <span className="font-medium">{book.format || "N/A"}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiBook className="mr-2 h-5 w-5 text-purple-600" />
                Categories & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {(book.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
                {(!book.tags || book.tags.length === 0) && (
                  <span className="text-gray-500 text-sm">
                    No tags available
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <Card className="border-0 shadow-xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Books
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBooks.map((relatedBook) => (
                  <Link
                    key={relatedBook.id}
                    to={`/books/${relatedBook.id}`}
                    className="block group"
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={relatedBook.coverImage}
                            alt={relatedBook.title}
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {relatedBook.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {relatedBook.author}
                            </p>
                            <div className="flex items-center mt-2">
                              {renderStars(relatedBook.rating || 0)}
                              <span className="ml-2 text-sm text-gray-600">
                                {relatedBook.rating || 0}
                              </span>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                relatedBook.price > 0
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {relatedBook.price > 0 ? `$${relatedBook.price}` : "Free"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Reading Modal */}
      {isReading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Reading: {book.title}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setIsReading(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </Button>
            </div>

            <div className="p-6 h-96 overflow-y-auto">
              <div className="prose max-w-none text-lg leading-relaxed">
                <h3 className="text-xl font-semibold mb-4">
                  Page {currentPage + 1} of {pages.length}
                </h3>
                <div className="whitespace-pre-wrap">
                  {pages[currentPage] || "No content available."}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous Page
              </Button>

              <span className="text-gray-600">
                {currentPage + 1} / {pages.length}
              </span>

              <Button
                variant="primary"
                onClick={() =>
                  setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
                }
                disabled={currentPage === pages.length - 1}
              >
                Next Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;