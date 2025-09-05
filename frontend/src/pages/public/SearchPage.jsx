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
  // Add to your SearchPage component
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };
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

  const hasActiveFilters =
    searchQuery || filters.category || filters.author || filters.year;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiHome className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/browse")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Browse Categories
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Advanced Search
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Find exactly what you need across our entire collection of 2,500+
            books
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 border-0 shadow-2xl">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search */}
            <div className="relative">
              <TextInput
                type="text"
                placeholder="🔍 Search for titles, authors, subjects, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-12 py-4 text-lg border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-600" />
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dewey Category
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <TextInput
                  type="text"
                  placeholder="Filter by author..."
                  value={filters.author}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publication Year
                </label>
                <TextInput
                  type="number"
                  placeholder="Filter by year..."
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  min="1900"
                  max="2025"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                variant="gradient"
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

        {/* Results */}
        {isSearching ? (
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              Searching our collection...
            </h3>
            <p className="text-gray-600">
              Please wait while we find the best matches for your search.
            </p>
          </Card>
        ) : searchResults.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results ({searchResults.length})
              </h2>
              <span className="text-gray-600 text-sm flex items-center">
                <FiClock className="h-4 w-4 mr-1" />
                Found in 0.2s
              </span>
            </div>

            {searchResults.map((book) => (
              <Card
                key={book.id}
                className="border-0 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      <FiBook />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-700 mb-3">{book.description}</p>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
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
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm py-16">
            <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              No results found
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              We couldn't find any books matching your search criteria. Try
              adjusting your filters or search terms.
            </p>
            <Button variant="primary" onClick={clearFilters}>
              Clear Search Filters
            </Button>
          </Card>
        ) : (
          /* Empty State */
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm py-16">
            <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              Start Your Search
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Enter keywords in the search bar above to discover books from our
              collection. You can search by title, author, subject, or Dewey
              Decimal number.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-500 mb-8">
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
        <Card className="mt-12 border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FiFilter className="h-5 w-5 mr-2 text-blue-600" />
            Search Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
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
        <div className="fixed inset-0 bg-blend-color bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedBook.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-6xl">
                  <FiBook />
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Author
                    </h4>
                    <p className="text-lg text-gray-900">
                      {selectedBook.author}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Publication Year
                    </h4>
                    <p className="text-lg text-gray-900">{selectedBook.year}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Dewey Decimal Classification
                    </h4>
                    <p className="text-lg text-gray-900">
                      {selectedBook.ddc} ({selectedBook.category})
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Dewey Category
                    </h4>
                    <p className="text-lg text-gray-900">
                      {selectedBook.deweyCategory}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h4>
                <p className="text-gray-700">{selectedBook.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" className="flex-1">
                  <FiBookOpen className="mr-2 h-5 w-5" />
                  Read Now
                </Button>
                <Button variant="secondary" className="flex-1">
                  Download PDF
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
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
