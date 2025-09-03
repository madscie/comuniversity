// src/pages/public/SearchPage.jsx
import { useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiBook,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import TextInput from "../../components/UI/TextInput";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    author: "",
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
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchResults(mockResults);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
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
                className="w-full pl-6 pr-12 py-4 text-lg border-0 shadow-sm"
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
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <option value="">All Categories</option>
                  <option value="000">General Works</option>
                  <option value="500">Science & Math</option>
                  <option value="800">Literature</option>
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
                  onChange={(e) =>
                    setFilters({ ...filters, author: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFilters({ ...filters, year: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              variant="gradient"
              className="w-full py-4 text-lg font-semibold"
            >
              <FiSearch className="mr-3 h-6 w-6" />
              Search Collection
            </Button>
          </form>
        </Card>

        {/* Results */}
        {searchResults.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
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
                    <Button variant="primary" className="whitespace-nowrap">
                      View Details
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Search across 2,500+ books</div>
              <div>• Filter by category, author, year</div>
              <div>• Instant results with relevance ranking</div>
            </div>
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
    </div>
  );
};

export default SearchPage;
