// pages/checkout/CheckoutDownloadPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiBook,
  FiLock,
  FiCreditCard,
  FiShield,
  FiArrowLeft,
  FiCheck,
  FiDownload,
  FiUser,
  FiGlobe,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { useAuthStore } from "../../store/authStore";
import { booksData, getBookById } from "../../data/BookData";
import DownloadHandler from "../../components/Download/DownloadHandler";

const CheckoutDownloadPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDownloadHandler, setShowDownloadHandler] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("PDF");

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      console.log("Fetching book with ID:", bookId);

      setTimeout(() => {
        try {
          const foundBook = getBookById(parseInt(bookId));
          console.log("Found book:", foundBook);

          if (!foundBook) {
            const bookFromArray = booksData.find(
              (b) => b.id === parseInt(bookId)
            );
            setBook(bookFromArray || null);
          } else {
            setBook(foundBook);
          }
        } catch (error) {
          console.error("Error fetching book:", error);
          setBook(null);
        } finally {
          setLoading(false);
        }
      }, 1000);
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const handlePaymentSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData);
    // Show download handler after successful payment
    setShowDownloadHandler(true);
  };

  const handleDownloadComplete = () => {
    // Redirect to library or show success message
    setTimeout(() => {
      navigate("/my-library");
    }, 2000);
  };

  const handleDownloadCancel = () => {
    setShowDownloadHandler(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Book Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The book you're looking for doesn't exist or is not available for
            purchase.
          </p>
          <Button onClick={() => navigate("/browse")}>
            <FiArrowLeft className="mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Book
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">
            Pay securely and download your book instantly
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Order Summary & Payment */}
          <div className="xl:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="flex space-x-4">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{book.title}</h3>
                  <p className="text-gray-600 text-sm">by {book.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-500">
                      {book.pages} pages • {book.format}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      ${book.price}
                    </div>
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Download Format
                </label>
                <div className="flex space-x-3">
                  {book.format.includes("PDF") && (
                    <button
                      type="button"
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedFormat === "PDF"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedFormat("PDF")}
                    >
                      PDF
                    </button>
                  )}
                  {book.format.includes("EPUB") && (
                    <button
                      type="button"
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedFormat === "EPUB"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedFormat("EPUB")}
                    >
                      EPUB
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* Payment Section */}
            <Card>
              <div className="flex items-center mb-6">
                <FiLock className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Secure Payment
                </h2>
              </div>
              {/* DownloadHandler Component for Payment & Download */}
              // In CheckoutDownloadPage.jsx
              <DownloadHandler
                bookId={book.id} // This is crucial!
                bookTitle={book.title}
                bookAuthor={book.author}
                price={book.price}
                format={selectedFormat}
                onComplete={handleDownloadComplete}
                onCancel={handleDownloadCancel}
              />
            </Card>

            {/* User Info */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Account Information
              </h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Features & Benefits */}
          <div className="space-y-6">
            {/* Features */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What You Get
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FiDownload className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Instant download access</span>
                </div>
                <div className="flex items-center">
                  <FiShield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">
                    Lifetime access to purchased content
                  </span>
                </div>
                <div className="flex items-center">
                  <FiBook className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">
                    Multiple formats: {book.format}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">
                    30-day money-back guarantee
                  </span>
                </div>
              </div>
            </Card>

            {/* Trust Badges */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Secure & Trusted
              </h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FiLock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <span className="text-xs text-gray-600">SSL Secure</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FiGlobe className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-xs text-gray-600">PCI Compliant</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FiShield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <span className="text-xs text-gray-600">Encrypted</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FiCheck className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <span className="text-xs text-gray-600">Guaranteed</span>
                </div>
              </div>
            </Card>

            {/* Support */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Need Help?
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 24/7 Customer Support</p>
                <p>• Instant Download Assistance</p>
                <p>• Format Compatibility Help</p>
                <p>• Money-back Guarantee</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDownloadPage;
