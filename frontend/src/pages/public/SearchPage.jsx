// src/pages/public/SearchPage.jsx
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
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import TextInput from "../../components/UI/TextInput";

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

  const [filters, setFilters] = useState({
    category: urlCategory,
    author: urlAuthor,
    year: "",
  });

  const mockResults = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      author: "John Smith",
      year: 2022,
      ddc: "004.5",
      category: "Computer Science",
      description:
        "Comprehensive guide to modern computer science principles and practices.",
      deweyCategory: "000-099",
    },
    {
      id: 2,
      title: "Advanced Mathematics for Engineers",
      author: "Dr. Emily Chen",
      year: 2021,
      ddc: "510.2",
      category: "Mathematics",
      description:
        "Advanced mathematical concepts applied to engineering problems.",
      deweyCategory: "500-599",
    },
    {
      id: 3,
      title: "World History: Modern Era",
      author: "Prof. Robert Johnson",
      year: 2020,
      ddc: "909.8",
      category: "History",
      description:
        "Detailed analysis of world history from 1900 to present day.",
      deweyCategory: "900-999",
    },
    {
      id: 4,
      title: "Organic Chemistry Fundamentals",
      author: "Dr. Sarah Williams",
      year: 2019,
      ddc: "547",
      category: "Chemistry",
      description:
        "Comprehensive guide to organic chemistry principles and reactions.",
      deweyCategory: "500-599",
    },
    {
      id: 5,
      title: "Renaissance Art Masterpieces",
      author: "Maria Gonzalez",
      year: 2018,
      ddc: "709.024",
      category: "Art History",
      description:
        "Exploration of influential art from the Renaissance period.",
      deweyCategory: "700-799",
    },
  ];

  const deweyCategories = [
    { value: "", label: "All Categories" },
    { value: "000-099", label: "000-099: General Works" },
    { value: "100-199", label: "100-199: Philosophy & Psychology" },
    { value: "200-299", label: "200-299: Religion" },
    { value: "300-399", label: "300-399: Social Sciences" },
    { value: "400-499", label: "400-499: Language" },
    { value: "500-599", label: "500-599: Science & Math" },
    { value: "600-699", label: "600-699: Technology" },
    { value: "700-799", label: "700-799: Arts & Recreation" },
    { value: "800-899", label: "800-899: Literature" },
    { value: "900-999", label: "900-999: History & Geography" },
  ];

  // Perform search when URL parameters change
  useEffect(() => {
    if (urlQuery || urlCategory || urlAuthor) {
      performSearch();
    }
  }, [urlQuery, urlCategory, urlAuthor]);

  const performSearch = () => {
    setIsSearching(true);

    // Simulate API call delay
    setTimeout(() => {
      let results = [...mockResults];

      // Filter by search query
      if (urlQuery) {
        const query = urlQuery.toLowerCase();
        results = results.filter(
          (book) =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.description.toLowerCase().includes(query) ||
            book.ddc.includes(query)
        );
      }

      // Filter by category
      if (urlCategory) {
        results = results.filter((book) => book.deweyCategory === urlCategory);
      }

      // Filter by author
      if (urlAuthor) {
        results = results.filter((book) =>
          book.author.toLowerCase().includes(urlAuthor.toLowerCase())
        );
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (
      searchQuery.trim() ||
      filters.category ||
      filters.author ||
      filters.year
    ) {
      // Update URL with search parameters
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
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleViewDetailsPage = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const hasActiveFilters =
    searchQuery || filters.category || filters.author || filters.year;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-4 sm:py-6 lg:py-8 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm sm:text-base"
          >
            <FiHome className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/browse")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Browse Categories
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Advanced Search
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Find exactly what you need across our entire collection of 2,500+
            books
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6 sm:mb-8 border-0 shadow-xl dark:shadow-gray-900/50">
          <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
            {/* Main Search */}
            <div className="relative">
              <TextInput
                type="text"
                placeholder="🔍 Search for titles, authors, subjects, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 sm:pl-6 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base border-0 shadow-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
              />
              <FiSearch className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Dewey Category
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  {deweyCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Author
                </label>
                <TextInput
                  type="text"
                  placeholder="Filter by author..."
                  value={filters.author}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Publication Year
                </label>
                <TextInput
                  type="number"
                  placeholder="Filter by year..."
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  min="1900"
                  max="2025"
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Search Collection
                  </>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearFilters}
                  className="py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Results */}
        {isSearching ? (
          <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-12 sm:py-16">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-4 sm:mb-6"></div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
              Searching our collection...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Please wait while we find the best matches for your search.
            </p>
          </Card>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Search Results ({searchResults.length})
              </h2>
              <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex items-center">
                <FiClock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Found in 0.2s
              </span>
            </div>

            {searchResults.map((book) => (
              <Card
                key={book.id}
                className="border-0 hover:shadow-xl transition-shadow duration-300 dark:shadow-gray-900/50"
              >
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-br from-gray-700 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl">
                      <FiBook />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-2 sm:mb-3">
                      {book.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <strong>Author:</strong> {book.author}
                      </div>
                      <div>
                        <strong>Year:</strong> {book.year}
                      </div>
                      <div>
                        <strong>DDC:</strong> {book.ddc} ({book.category})
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => handleViewDetails(book)}
                      variant="primary"
                      className="whitespace-nowrap text-xs sm:text-sm"
                    >
                      View Details
                      <FiArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : urlQuery || filters.category || filters.author ? (
          /* No Results State */
          <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-12 sm:py-16">
            <FiSearch className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8">
              We couldn't find any books matching your search criteria. Try
              adjusting your filters or search terms.
            </p>
            <Button variant="primary" onClick={clearFilters}>
              Clear Search Filters
            </Button>
          </Card>
        ) : (
          /* Empty State */
          <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-12 sm:py-16">
            <FiSearch className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
              Start Your Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8">
              Enter keywords in the search bar above to discover books from our
              collection. You can search by title, author, subject, or Dewey
              Decimal number.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
              <div>• Search across 2,500+ books</div>
              <div>• Filter by category, author, year</div>
              <div>• Instant results with relevance ranking</div>
            </div>
            <Button variant="primary" onClick={() => navigate("/browse")}>
              Browse Categories Instead
            </Button>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="mt-8 sm:mt-12 border-0 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
            <FiFilter className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 dark:text-green-400" />
            Search Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>Use quotes</strong> for exact phrases: "computer science"
            </div>
            <div>
              <strong>DDC numbers:</strong> Search "510" for mathematics
            </div>
            <div>
              <strong>Combine terms:</strong> history + europe + 20th century
            </div>
            <div>
              <strong>Author search:</strong> author:smith
            </div>
          </div>
        </Card>
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedBook.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl sm:text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-gray-700 to-green-600 rounded-xl flex items-center justify-center text-white text-4xl sm:text-6xl">
                  <FiBook />
                </div>

                <div>
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Author
                    </h4>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedBook.author}
                    </p>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Publication Year
                    </h4>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedBook.year}
                    </p>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dewey Decimal Classification
                    </h4>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedBook.ddc} ({selectedBook.category})
                    </p>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dewey Category
                    </h4>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedBook.deweyCategory}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {selectedBook.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={() => handleViewDetailsPage(selectedBook.id)}
                  variant="primary"
                  className="flex-1 text-sm sm:text-base"
                >
                  <FiBookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Read Now
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 text-sm sm:text-base"
                >
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="text-sm sm:text-base"
                >
                  Close
                </Button>
              </div>

              <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Reading options will be fully implemented in the next
                  development phase
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
