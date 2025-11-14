import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiBook,
  FiClock,
  FiArrowRight,
  FiHome,
  FiArrowLeft,
  FiBookOpen,
  FiAlertCircle,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import TextInput from "../../components/UI/TextInput";
import { api } from "../../config/api";
import { componentClasses } from "../../components/UI/TailwindColors";

// Enhanced Loading Spinner
const LoadingSpinner = ({ message = "Searching..." }) => (
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

// Star component for ratings
const FiStar = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlAuthor = searchParams.get("author") || "";

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: urlCategory,
    author: urlAuthor,
    year: "",
  });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Perform search when URL parameters change
  useEffect(() => {
    if (urlQuery || urlCategory || urlAuthor) {
      performSearch();
    }
  }, [urlQuery, urlCategory, urlAuthor]);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    setError(null);

    try {
      const searchParams = {};
      if (urlQuery) searchParams.search = urlQuery;
      if (urlCategory) searchParams.category = urlCategory;
      if (urlAuthor) searchParams.author = urlAuthor;

      console.log("🔍 Performing search with params:", searchParams);

      const response = await api.getBooks(searchParams);

      if (response.success) {
        setSearchResults(response.data.books || []);
        console.log(`✅ Found ${response.data.books.length} books`);
      } else {
        setSearchResults([]);
        setError("Failed to search books");
      }
    } catch (error) {
      console.error("❌ Search error:", error);
      setError("Failed to connect to server. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (
      searchQuery.trim() ||
      filters.category ||
      filters.author ||
      filters.year
    ) {
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (filters.category) params.category = filters.category;
      if (filters.author) params.author = filters.author;
      if (filters.year) params.year = filters.year;

      setSearchParams(params);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      category: "",
      author: "",
      year: "",
    });
    setSearchParams({});
    setSearchResults([]);
    setError(null);
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleViewDetailsPage = (bookId) => {
    console.log("Selected Book:", bookId);
    navigate(`/books/${bookId}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const renderStars = (rating) => {
    const normalizedRating = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(normalizedRating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const hasActiveFilters =
    searchQuery || filters.category || filters.author || filters.year;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <FiHome className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/browse")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Browse Categories
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Search
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Find exactly what you need across our entire collection
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 border-0 shadow-2xl dark:shadow-gray-900/50 bg-white dark:bg-gray-800 transition-colors duration-300">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search */}
            <div className="relative">
              <TextInput
                type="text"
                placeholder="🔍 Search for titles, authors, subjects, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-12 py-4 text-lg border-0 shadow-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              />
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-600 dark:text-green-400" />
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.category} value={category.category}>
                      {category.category} ({category.book_count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author
                </label>
                <TextInput
                  type="text"
                  placeholder="Filter by author..."
                  value={filters.author}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publication Year
                </label>
                <TextInput
                  type="number"
                  placeholder="Filter by year..."
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  min="1900"
                  max="2025"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 py-4 text-lg font-semibold"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-3 h-6 w-6" />
                    Search Collection
                  </>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearFilters}
                  className="py-4 text-lg font-semibold"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-0 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 transition-colors duration-300">
            <div className="flex items-center p-4">
              <FiAlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </Card>
        )}

        {/* Results */}
        {isSearching ? (
          <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-16 transition-colors duration-300">
            <LoadingSpinner message="Searching our collection..." />
          </Card>
        ) : searchResults.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Search Results ({searchResults.length})
              </h2>
              <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                <FiClock className="h-4 w-4 mr-1" />
                Found instantly
              </span>
            </div>

            {searchResults.map((book) => (
              <Card
                key={book.id}
                className="border-0 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-24 bg-gradient-to-br from-gray-700 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl overflow-hidden">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiBook />
                      )}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {book.description}
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <strong>Author:</strong> {book.author}
                      </div>
                      <div>
                        <strong>Year:</strong> {book.publishedYear || "N/A"}
                      </div>
                      <div>
                        <strong>Category:</strong> {book.category}
                      </div>
                    </div>

                    <div className="flex items-center mt-3">
                      {renderStars(book.rating)}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {book.rating || "No ratings"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => handleViewDetails(book)}
                      variant="primary"
                      className="whitespace-nowrap"
                    >
                      View Details
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : urlQuery || filters.category || filters.author ? (
          /* No Results State */
          <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-16 transition-colors duration-300">
            <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              We couldn't find any books matching your search criteria. Try
              adjusting your filters or search terms.
            </p>
            <Button variant="primary" onClick={clearFilters}>
              Clear Search Filters
            </Button>
          </Card>
        ) : (
          /* Empty State */
          <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-16 transition-colors duration-300">
            <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              Start Your Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Enter keywords in the search bar above to discover books from our
              collection. You can search by title, author, subject, or category.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <div>• Search across all books</div>
              <div>• Filter by category, author, year</div>
              <div>• Instant results with relevance ranking</div>
            </div>
            <Button variant="primary" onClick={() => navigate("/browse")}>
              Browse Categories Instead
            </Button>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="mt-12 border-0 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiFilter className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Search Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>Use quotes</strong> for exact phrases: "computer science"
            </div>
            <div>
              <strong>Category search:</strong> Search by specific categories
            </div>
            <div>
              <strong>Combine terms:</strong> history + europe
            </div>
            <div>
              <strong>Author search:</strong> Use author filter
            </div>
          </div>
        </Card>
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedBook.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="w-full h-64 bg-gradient-to-br from-gray-700 to-green-600 rounded-xl flex items-center justify-center text-white text-6xl overflow-hidden">
                  {selectedBook.cover_image ? (
                    <img
                      src={selectedBook.cover_image}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiBook />
                  )}
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Author
                    </h4>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {selectedBook.author}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Publication Year
                    </h4>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {selectedBook.publishedYear || "N/A"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Category
                    </h4>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {selectedBook.category}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dewey Decimal
                    </h4>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {selectedBook.dewey_number || "N/A"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Price
                    </h4>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {selectedBook.price > 0
                        ? `$${selectedBook.price}`
                        : "Free"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedBook.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleViewDetailsPage(selectedBook.id)}
                  variant="primary"
                  className="flex-1"
                >
                  <FiBookOpen className="mr-2 h-5 w-5" />
                  View Full Details
                </Button>
                <Button variant="secondary" className="flex-1">
                  Download PDF
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
