// src/pages/public/MyLibraryPage.jsx
import { useState, useEffect } from "react";
import {
  FiBook,
  FiDownload,
  FiSearch,
  FiCalendar,
  FiEye,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const LibraryPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load purchased books from localStorage
    const loadPurchases = () => {
      setLoading(true);
      setTimeout(() => {
        const userLibrary = JSON.parse(
          localStorage.getItem("userLibrary") || "[]"
        );
        setPurchases(userLibrary);
        setFilteredPurchases(userLibrary);
        setLoading(false);
      }, 1000);
    };

    loadPurchases();
  }, []);

  useEffect(() => {
    // Filter purchases based on search term
    const filtered = purchases.filter(
      (purchase) =>
        purchase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
  }, [searchTerm, purchases]);

  const handleDownload = (purchase) => {
    // Mock download functionality
    console.log(`Downloading: ${purchase.title}`);

    // In a real app, this would trigger file download
    alert(
      `Starting download: ${purchase.title}.${purchase.format.toLowerCase()}`
    );

    // Track download in localStorage
    const downloads = JSON.parse(
      localStorage.getItem("downloadHistory") || "[]"
    );
    downloads.push({
      id: Math.random().toString(36).substr(2, 9),
      bookId: purchase.bookId,
      title: purchase.title,
      downloadedAt: new Date().toISOString(),
      format: purchase.format,
    });
    localStorage.setItem("downloadHistory", JSON.stringify(downloads));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-6 sm:py-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Loading your library...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-4 sm:py-6 lg:py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
            Your purchased books and resources
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4 text-center dark:shadow-gray-900/50">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
              {purchases.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Total Books
            </div>
          </Card>
          <Card className="p-3 sm:p-4 text-center dark:shadow-gray-900/50">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
              {purchases.filter((p) => p.format.includes("PDF")).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              PDF Books
            </div>
          </Card>
          <Card className="p-3 sm:p-4 text-center dark:shadow-gray-900/50">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
              {purchases.filter((p) => p.format.includes("EPUB")).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              EPUB Books
            </div>
          </Card>
          <Card className="p-3 sm:p-4 text-center dark:shadow-gray-900/50">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
              ${purchases.reduce((total, p) => total + p.price, 0).toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Total Spent
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-3 sm:p-4 mb-4 sm:mb-6 dark:shadow-gray-900/50">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your library by title or author..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Books Grid */}
        {filteredPurchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPurchases.map((purchase) => (
              <Card
                key={purchase.id}
                className="overflow-hidden hover:shadow-lg transition-shadow dark:shadow-gray-900/50"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBook className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                        Purchased
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">
                    {purchase.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                    by {purchase.author}
                  </p>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                    <div className="flex items-center">
                      <FiCalendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {formatDate(purchase.purchaseDate)}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      ${purchase.price}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {purchase.format}
                    </span>
                    <div className="flex space-x-1 sm:space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(purchase)}
                        className="text-xs sm:text-sm"
                      >
                        <FiDownload className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8 sm:py-12 dark:shadow-gray-900/50">
            <FiBook className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {purchases.length === 0
                ? "Your library is empty"
                : "No books found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto px-2">
              {purchases.length === 0
                ? "Purchase your first book to start building your library!"
                : "Try adjusting your search terms."}
            </p>
            {purchases.length === 0 && (
              <Button
                onClick={() => (window.location.href = "/browse")}
                className="text-sm sm:text-base"
              >
                Browse Books
              </Button>
            )}
          </Card>
        )}

        {/* Download History */}
        {purchases.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Download History
            </h2>
            <Card className="dark:shadow-gray-900/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Book
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Downloaded
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Format
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {JSON.parse(localStorage.getItem("downloadHistory") || "[]")
                      .slice(0, 5)
                      .map((download) => (
                        <tr
                          key={download.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {download.title}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(download.downloadedAt)}
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {download.format}
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDownload({
                                  ...download,
                                  bookId: download.bookId,
                                  title: download.title,
                                  format: download.format,
                                })
                              }
                              className="text-xs sm:text-sm"
                            >
                              <FiDownload className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Download Again
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
