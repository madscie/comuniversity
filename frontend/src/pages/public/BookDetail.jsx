// frontend/pages/public/BookDetail.js
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
  FiLock,
  FiShoppingCart,
  FiUser,
  FiClock,
  FiTag,
  FiFileText,
  FiType,
} from "react-icons/fi";
import { MdPayment } from "react-icons/md";
import { SiStripe } from "react-icons/si";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { bookService } from "../../services/bookService";
import { readingService } from "../../services/readingService";
import { getImageUrl, handleImageError } from "../../utils/fileHelpers";
import { formatDate } from "../../utils/dateHelper";
import { renderStars } from "../../utils/ratingHelper";
import { clearCorruptedData } from "../../utils/storageHelpers";
import { formatReadingTime } from "../../utils/dateHelper";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
      {message}
    </p>
  </div>
);

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [readingStats, setReadingStats] = useState(null);
  
  // ADDED: Payment state variables
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // Helper to clean file URLs
  const cleanFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    
    let cleanUrl = fileUrl;
    
    if (cleanUrl.includes("uploads/files/uploads/files")) {
      cleanUrl = cleanUrl.replace("uploads/files/uploads/files", "uploads/files");
    }
    
    cleanUrl = cleanUrl.replace(/\/\//g, '/');
    
    return cleanUrl;
  };

  // Get the correct file URL for access
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    
    const cleanUrl = cleanFileUrl(fileUrl);
    
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    
    if (cleanUrl.startsWith('uploads/files/')) {
      return `http://localhost:5000/${cleanUrl}`;
    }
    
    return `http://localhost:5000/uploads/files/${cleanUrl}`;
  };

  // Helper to get file extension
  const getFileExtension = (filename) => {
    if (!filename) return 'pdf';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : 'pdf';
  };

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
          
          // Check if book is already purchased
          const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
          console.log("Purchased books from localStorage:", purchasedBooks);
          console.log("Current book ID:", id);
          console.log("Is current book purchased?", purchasedBooks.includes(id));
          
          if (purchasedBooks.includes(id)) {
            setHasPurchased(true);
            setDebugInfo(`Book ${id} found in purchasedBooks`);
          } else {
            setDebugInfo(`Book ${id} NOT found in purchasedBooks`);
          }
          
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

      if (relatedResponse && (relatedResponse.success || relatedResponse.data)) {
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

  // FIXED: Payment handler function
  const handlePayment = async (method) => {
    if (!book || bookData.price <= 0) return;

    console.log('🔄 Starting payment for method:', method);
    setProcessingPayment(true);
    setPaymentMethod(method);
    
    const userEmail = localStorage.getItem('userEmail') || prompt('Please enter your email to continue with payment:');
    if (!userEmail) {
      console.log('❌ No email provided');
      setProcessingPayment(false);
      return;
    }
    
    localStorage.setItem('userEmail', userEmail);

    let successUrl;
    
    if (method === 'stripe') {
      // Stripe can handle the placeholder
      successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&book_id=${book.id || id}&provider=stripe`;
    } else if (method === 'paypal') {
      // FIXED: PayPal CANNOT handle {ORDER_ID} placeholder - using simple URL
      successUrl = `${window.location.origin}/payment-success?book_id=${book.id || id}&provider=paypal`;
    }

    const cancelUrl = `${window.location.origin}/payment-cancelled?book_id=${book.id || id}`;

    console.log('📤 Payment URLs:', {
      successUrl,
      cancelUrl,
      email: userEmail,
      bookId: book.id || id
    });

    try {
      const paymentData = {
        amount: bookData.price,
        bookId: book.id || id,
        email: userEmail,
        successUrl,
        cancelUrl,
        type: 'book'
      };
      
      console.log('📦 Sending payment data:', paymentData);
      
      const res = await fetch(`http://localhost:5000/api/pay/${method}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData),
      });

      console.log('📥 Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Payment failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('💰 Payment response:', data);

      if (data.url) {
        console.log(`🔗 Redirecting to payment page: ${data.url}`);
        // Save orderId for PayPal for later verification
        if (method === 'paypal' && data.orderId) {
          localStorage.setItem('lastPaypalOrderId', data.orderId);
        }
        window.location.href = data.url;
      } else {
        console.error('❌ No payment URL received:', data);
        throw new Error('No payment URL received from server');
      }
    } catch (error) {
      console.error('❌ Payment failed:', error);
      alert(`Payment failed: ${error.message}\n\nCheck browser console for details.`);
      setProcessingPayment(false);
      setPaymentMethod('');
    }
  };

  // ADDED: Test purchase handler
  const handleTestPurchase = async () => {
    if (!book) return;

    const userEmail = localStorage.getItem('userEmail') || prompt('Please enter your email for test purchase:');
    if (!userEmail) return;

    try {
      const res = await fetch('http://localhost:5000/api/pay/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          bookId: book.id || id,
          type: 'book'
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Test purchase successful! Book added to your library.');
        
        const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
        if (!purchasedBooks.includes(id)) {
          purchasedBooks.push(id);
          localStorage.setItem('purchasedBooks', JSON.stringify(purchasedBooks));
        }
        
        setHasPurchased(true);
        setShowPaymentOptions(false);
        window.location.reload();
      } else {
        throw new Error(data.error || 'Test purchase failed');
      }
    } catch (error) {
      console.error('Test purchase error:', error);
      alert(`Test purchase failed: ${error.message}`);
    }
  };

  // Updated handlers that check purchase status
  const handleReadOnline = () => {
    if (!book?.file_url) {
      alert("No digital version available for this book");
      return;
    }
    
    // FREE BOOKS: Allow access immediately
    if (bookData.price === 0) {
      const fileUrl = getFileUrl(book.file_url);
      console.log("📖 Opening for online reading:", fileUrl);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      
      if (book) {
        readingService.updateReadingStats(book.id, {
          lastRead: new Date().toISOString(),
          totalReadingTime: (readingStats?.totalReadingTime || 0) + 1,
          reads: (readingStats?.reads || 0) + 1,
        });
        setReadingStats(readingService.getReadingStats(book.id));
      }
      return;
    }
    
    // PREMIUM BOOKS: Check purchase
    if (!hasPurchased) {
      alert("Please purchase this book to read it online");
      setShowPaymentOptions(true);
      return;
    }
    
    // User has purchased, open the file
    const fileUrl = getFileUrl(book.file_url);
    console.log("📖 Opening for online reading:", fileUrl);
    
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
    
    if (book) {
      readingService.updateReadingStats(book.id, {
        lastRead: new Date().toISOString(),
        totalReadingTime: (readingStats?.totalReadingTime || 0) + 1,
        reads: (readingStats?.reads || 0) + 1,
      });
      setReadingStats(readingService.getReadingStats(book.id));
    }
  };

  const handleViewDocument = () => {
    if (!book?.file_url) {
      alert("No file available to view");
      return;
    }
    
    // FREE BOOKS: Allow access immediately
    if (bookData.price === 0) {
      const fileUrl = getFileUrl(book.file_url);
      console.log("👁️ Opening for viewing:", fileUrl);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // PREMIUM BOOKS: Check purchase
    if (!hasPurchased) {
      alert("Please purchase this book to view the document");
      setShowPaymentOptions(true);
      return;
    }
    
    // User has purchased, open the file
    const fileUrl = getFileUrl(book.file_url);
    console.log("👁️ Opening for viewing:", fileUrl);
    
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    if (!book?.file_url) {
      alert("File not available for download");
      return;
    }
    
    // FREE BOOKS: Allow download immediately
    if (bookData.price === 0) {
      const fileUrl = getFileUrl(book.file_url);
      const fileName = book.file_name || `${book.title}.${getFileExtension(book.file_url)}`;
      
      try {
        console.log("📥 Downloading:", fileUrl);
        
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (book) {
          readingService.updateReadingStats(book.id, {
            lastDownload: new Date().toISOString(),
            downloads: (readingStats?.downloads || 0) + 1,
          });
          setReadingStats(readingService.getReadingStats(book.id));
        }
        
        setTimeout(() => {
          alert(`"${fileName}" is downloading to your device.`);
        }, 100);
        
        return true;
      } catch (error) {
        console.error("❌ Download error:", error);
        alert("Download failed. Please try again.");
        return false;
      }
    }
    
    // PREMIUM BOOKS: Check purchase
    if (!hasPurchased) {
      alert("Please purchase this book to download it");
      setShowPaymentOptions(true);
      return;
    }
    
    // User has purchased, proceed with download
    const fileUrl = getFileUrl(book.file_url);
    const fileName = book.file_name || `${book.title}.${getFileExtension(book.file_url)}`;
    
    try {
      console.log("📥 Downloading:", fileUrl);
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (book) {
        readingService.updateReadingStats(book.id, {
          lastDownload: new Date().toISOString(),
          downloads: (readingStats?.downloads || 0) + 1,
        });
        setReadingStats(readingService.getReadingStats(book.id));
      }
      
      setTimeout(() => {
        alert(`"${fileName}" is downloading to your device.`);
      }, 100);
      
      return true;
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Download failed. Please try again.");
      return false;
    }
  };

  const toggleFavorite = () => {
    if (!book) return;
    const newFavoriteStatus = readingService.toggleFavorite(book.id);
    setIsFavorite(newFavoriteStatus);
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
    const stats = readingService.getReadingStats(book.id);
    return stats ? Math.min(stats.pagesRead || 0, 100) : 0;
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
    file_url: book?.file_url || null,
    file_extension: getFileExtension(book?.file_url),
  });

  const bookData = getBookData();

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "N/A";
    if (bytes < 1024) return bytes + " Bytes";
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1073741824).toFixed(2) + " GB";
  };

  // ADDED: Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentOptions || !book) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {processingPayment ? 'Processing...' : 'Buy Book'}
            </h3>
            {!processingPayment && (
              <button 
                onClick={() => setShowPaymentOptions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-light"
                disabled={processingPayment}
              >
                ✕
              </button>
            )}
          </div>

          {processingPayment ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Redirecting to {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Secure payment processing...
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll be redirected to the payment confirmation page after payment.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Book ID: {book.id || id}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    COMMUNIVERSITY LIBRARY
                  </h4>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-6">
                  <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-3">
                    Premium Book • Lifetime Access
                  </p>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      ${bookData.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      One-time purchase
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                    Choose your payment method:
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => handlePayment('stripe')}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      <SiStripe className="w-6 h-6 mr-3" />
                      Stripe
                    </button>
                    
                    <button
                      onClick={() => handlePayment('paypal')}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      <MdPayment className="w-6 h-6 mr-3" />
                      PayPal
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                  <FiLock className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Secure payment processing. Your financial information is encrypted and protected.
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  After payment, you will be redirected to the payment success page.
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6">
                  <button
                    onClick={handleTestPurchase}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Test Purchase (Development Only)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

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
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner message="Loading book..." />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-6xl">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center mb-2">
              <FiAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="font-semibold text-yellow-700 dark:text-yellow-300">Debug Info</span>
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
              <p>Book ID: {id}</p>
              <p>Price: ${bookData.price}</p>
              <p>Has Purchased: {hasPurchased ? 'YES' : 'NO'}</p>
              <p>Is Premium: {bookData.price > 0 ? 'YES' : 'NO'}</p>
              <p>Debug: {debugInfo}</p>
            </div>
          </div>
        )}

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
        <Card className="mb-6 sm:mb-8 lg:mb-12 border-0 shadow-xl dark:shadow-gray-900/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl">
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
                {bookData.file_extension && (
                  <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                    {bookData.file_extension.toUpperCase()} File
                  </span>
                )}
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

              {/* File Information */}
              {bookData.file_url && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      File Information
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {bookData.file_extension?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatFileSize(bookData.fileSize)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Format:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {bookData.format}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Book Purchase Prompt */}
              {bookData.price > 0 && !hasPurchased && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        🔒 Premium Book - Payment Required
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        You must purchase this book to access the content
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ${bookData.price}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          One-time purchase
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setShowPaymentOptions(true)}
                        className="px-6 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <FiShoppingCart className="mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Conditionally enabled based on purchase status */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                {/* READ ONLINE - Only enabled for free books or purchased premium books */}
                <Button
                  variant="primary"
                  onClick={handleReadOnline}
                  className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                  disabled={!bookData.file_url || (bookData.price > 0 && !hasPurchased)}
                >
                  <FiBookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {bookData.price > 0 && !hasPurchased ? "Purchase to Read" : 
                   overallProgress > 0 ? "Continue Reading" : "Read Online"}
                </Button>

                {/* DOWNLOAD - Only enabled for free books or purchased premium books */}
                <Button
                  variant="secondary"
                  onClick={handleDownload}
                  className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                  disabled={!bookData.file_url || (bookData.price > 0 && !hasPurchased)}
                >
                  <FiDownload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {bookData.price > 0 && !hasPurchased ? "Purchase to Download" : "Download File"}
                </Button>

                {/* VIEW DOCUMENT - Only enabled for free books or purchased premium books */}
                {bookData.file_url && (
                  <Button
                    variant="outline"
                    onClick={handleViewDocument}
                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                    disabled={!bookData.file_url || (bookData.price > 0 && !hasPurchased)}
                  >
                    <FiEye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {bookData.price > 0 && !hasPurchased ? "Purchase to View" : "View Document"}
                  </Button>
                )}
              </div>

              {/* Reading Progress - Only show if user has accessed the book */}
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
                      <span>{readingStats.pagesRead || 0} pages read</span>
                      <span>
                        {formatReadingTime(readingStats.totalReadingTime || 0)} spent
                      </span>
                    </div>
                  )}
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
                    {formatFileSize(bookData.fileSize)}
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
                      ? formatReadingTime(readingStats.totalReadingTime || 0)
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
      </div>

      {/* Payment Modal */}
      <PaymentModal />
    </div>
  );
};

export default BookDetail;