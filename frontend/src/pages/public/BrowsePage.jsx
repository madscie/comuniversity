import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiBook,
  FiChevronRight,
  FiHome,
  FiArrowLeft,
  FiAlertCircle,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { componentClasses } from "../../components/UI/TailwindColors";
import { bookService } from "../../services/bookService";
import { useApi } from "../../hooks/useApi";
import { getImageUrl, handleImageError, formatDate } from "../../utils/helpers";

// Dewey Decimal Categories
const DEWEY_CATEGORIES = [
  {
    number: "000-099",
    name: "General Works",
    description: "Computer science, information, general reference works",
    color: "from-gray-700 to-gray-800",
    icon: "📚",
  },
  {
    number: "100-199",
    name: "Philosophy & Psychology",
    description: "Ethics, logic, metaphysics, psychology",
    color: "from-gray-600 to-gray-700",
    icon: "🧠",
  },
  {
    number: "200-299",
    name: "Religion",
    description: "Christianity, other religions, mythology",
    color: "from-gray-700 to-green-600",
    icon: "⛪",
  },
  {
    number: "300-399",
    name: "Social Sciences",
    description: "Sociology, economics, law, politics, education",
    color: "from-green-600 to-green-700",
    icon: "🌍",
  },
  {
    number: "400-499",
    name: "Language",
    description: "Grammar, linguistics, dictionaries, specific languages",
    color: "from-gray-600 to-gray-700",
    icon: "🗣️",
  },
  {
    number: "500-599",
    name: "Natural Sciences & Math",
    description: "Biology, physics, chemistry, astronomy, mathematics",
    color: "from-gray-700 to-green-600",
    icon: "🔬",
  },
  {
    number: "600-699",
    name: "Technology & Applied Sciences",
    description: "Medicine, engineering, agriculture, home economics",
    color: "from-green-600 to-green-700",
    icon: "⚙️",
  },
  {
    number: "700-799",
    name: "Arts & Recreation",
    description: "Music, fine arts, photography, sports",
    color: "from-gray-600 to-gray-700",
    icon: "🎨",
  },
  {
    number: "800-899",
    name: "Literature",
    description: "Poetry, plays, novels, essays from around the world",
    color: "from-gray-700 to-green-600",
    icon: "📖",
  },
  {
    number: "900-999",
    name: "History & Geography",
    description: "World history, geography, travel, biography",
    color: "from-green-600 to-green-700",
    icon: "🏛️",
  },
];

const CHILDRENS_CATEGORIES = [
  {
    number: "J 000-099",
    name: "Children's General Works",
    description: "Encyclopedias, reference books for kids",
    color: "from-gray-500 to-gray-600",
    icon: "📘",
  },
  {
    number: "J 100-199",
    name: "Children's Philosophy & Psychology",
    description: "Feelings, thinking, values for young readers",
    color: "from-gray-400 to-gray-500",
    icon: "💭",
  },
  {
    number: "J 200-299",
    name: "Children's Religion",
    description: "Bible stories, world religions, mythology",
    color: "from-gray-500 to-green-500",
    icon: "🙏",
  },
  {
    number: "J 300-399",
    name: "Children's Social Sciences",
    description: "Friends, community, cultures, careers",
    color: "from-green-500 to-green-600",
    icon: "🤝",
  },
  {
    number: "J 400-499",
    name: "Children's Language",
    description: "Grammar, ABCs, beginner dictionaries",
    color: "from-gray-400 to-gray-500",
    icon: "🔤",
  },
  {
    number: "J 500-599",
    name: "Children's Natural Sciences & Math",
    description: "Animals, space, plants, numbers",
    color: "from-gray-500 to-green-500",
    icon: "🌱",
  },
  {
    number: "J 600-699",
    name: "Children's Technology",
    description: "Inventions, health, how things work",
    color: "from-green-500 to-green-600",
    icon: "🛠️",
  },
  {
    number: "J 700-799",
    name: "Children's Arts & Recreation",
    description: "Drawing, music, sports, crafts",
    color: "from-gray-400 to-gray-500",
    icon: "🎨",
  },
  {
    number: "J 800-899",
    name: "Children's Literature",
    description: "Stories, poems, fairy tales",
    color: "from-gray-500 to-green-500",
    icon: "📖",
  },
  {
    number: "J 900-999",
    name: "Children's History & Geography",
    description: "History, maps, cultures of the world",
    color: "from-green-500 to-green-600",
    icon: "🌍",
  },
];

const BrowsePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [allBooks, setAllBooks] = useState([]); // All books
  const [filteredBooks, setFilteredBooks] = useState([]); // Books for current category

  // Use custom hooks for API calls
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    execute: loadCategories,
  } = useApi(() => bookService.getCategories(), false);

  const {
    data: booksData,
    loading: booksLoading,
    error: booksError,
    execute: loadBooks,
  } = useApi(() => bookService.getBooks(), false);

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    loadBooks();
  }, []);

  // Update allBooks when booksData changes
  useEffect(() => {
    if (booksData) {
      const books = booksData.books || booksData.data?.books || [];
      setAllBooks(books);
      setFilteredBooks(books); // Initially show all books
    }
  }, [booksData]);

  // Set selected category based on URL parameter
  useEffect(() => {
    if (urlCategory) {
      const category =
        DEWEY_CATEGORIES.find((cat) => cat.number === urlCategory) ||
        CHILDRENS_CATEGORIES.find((cat) => cat.number === urlCategory);

      if (category) {
        setSelectedCategory(category);
        loadBooksByCategory(category.name);
      }
    }
  }, [urlCategory]);

  const loadBooksByCategory = async (categoryName) => {
    setLoadingCategory(true);
    try {
      // Filter books client-side based on category
      const filtered = allBooks.filter(
        (book) => book.category?.toLowerCase() === categoryName.toLowerCase()
      );
      setFilteredBooks(filtered);
    } catch (error) {
      console.error("Error filtering books by category:", error);
      setFilteredBooks([]);
    } finally {
      setLoadingCategory(false);
    }
  };
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setSearchParams({ category: category.number });
    await loadBooksByCategory(category.name);
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
    setSearchParams({});
    setFilteredBooks(allBooks); // Show all books when clearing selection
  };

  // Update the books variable to use filteredBooks
  const books = filteredBooks;
  const totalBooks = allBooks.length; // Total books in library

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleViewAllBooks = () => {
    if (selectedCategory) {
      navigate(`/search?category=${encodeURIComponent(selectedCategory.name)}`);
    } else {
      navigate("/search");
    }
  };

  const handleAdvancedSearch = () => {
    navigate("/search");
  };

  // Get book count for a category

  const getBookCount = (categoryName) => {
    if (!allBooks.length) return 0;
    return allBooks.filter(
      (book) => book.category?.toLowerCase() === categoryName.toLowerCase()
    ).length;
  };

  // Enhanced Loading Spinner
  const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-green-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
        {message}
      </p>
    </div>
  );

  // Calculate totals

  const categoryBooksCount = categoriesData?.data || [];

  const loading = categoriesLoading || booksLoading;
  const error = categoriesError || booksError;

  // Render book image with proper error handling
  const renderBookImage = (book) => {
    const imageUrl = getImageUrl(book.cover_image);

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={book.title}
          className="w-16 h-20 object-cover rounded-lg"
          onError={(e) => handleImageError(e, "📚")}
        />
      );
    }

    return (
      <div className="w-16 h-20 bg-gradient-to-br from-gray-700 to-green-600 rounded-lg flex items-center justify-center text-white">
        <FiBook className="h-6 w-6" />
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <LoadingSpinner message="Loading library categories..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md border-0 shadow-xl">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Books
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message || "Failed to load books. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6 sm:py-8 lg:py-12 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header with Back Button */}
        <div className="flex items-center mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <FiHome className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Browse Our Collection
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Explore{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {totalBooks}+ books
            </span>{" "}
            organized by the Dewey Decimal Classification System
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-12">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-gray-700 to-green-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="🔍 Quick search across all categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 sm:pl-6 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base border-0 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-3 sm:right-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </form>
        </div>

        {/* Back Button when category is selected */}
        {selectedCategory && (
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={handleClearSelection}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to All Categories
            </Button>
          </div>
        )}

        {/* Loading State for Category */}
        {(booksLoading || loadingCategory) && (
          <LoadingSpinner message="Loading books..." />
        )}

        {/* Dewey Categories Grid - Hidden when a category is selected */}
        {!selectedCategory && !loadingCategory && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {DEWEY_CATEGORIES.map((category) => {
                const bookCount = getBookCount(category.name);
                return (
                  <CategoryCard
                    key={category.number}
                    category={category}
                    bookCount={bookCount}
                    onSelect={handleCategorySelect}
                  />
                );
              })}
            </div>

            {/* Children's Section */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
              Children's Section
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {CHILDRENS_CATEGORIES.map((category) => {
                const bookCount = getBookCount(category.name);
                return (
                  <CategoryCard
                    key={category.number}
                    category={category}
                    bookCount={bookCount}
                    onSelect={handleCategorySelect}
                  />
                );
              })}
            </div>

            {/* Books Preview Section */}
            {books.length > 0 && (
              <Card className="mb-12 border-0 shadow-xl dark:shadow-gray-900/50">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Recently Added Books
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.slice(0, 6).map((book) => (
                      <div
                        key={book.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700"
                      >
                        <div className="flex items-start space-x-4">
                          {renderBookImage(book)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              by {book.author}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {book.category}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/books/${book.id}`)}
                              className="mt-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Selected Category Details */}
        {selectedCategory && !loadingCategory && (
          <Card className="mb-8 sm:mb-12 border-0 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 shadow-xl">
            <div className="text-center p-6 sm:p-8">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${selectedCategory.color} flex items-center justify-center text-white text-2xl sm:text-3xl mb-4 sm:mb-6 mx-auto`}
              >
                {selectedCategory.icon}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedCategory.number} - {selectedCategory.name}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto">
                {selectedCategory.description}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Button
                  variant="primary"
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                  onClick={handleViewAllBooks}
                >
                  <FiBook className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  View All {filteredBooks.length} Books
                </Button>
                <Button
                  variant="secondary"
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                  onClick={handleAdvancedSearch}
                >
                  <FiSearch className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Advanced Search in {selectedCategory.number}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Books List for Selected Category */}
        {selectedCategory && !loadingCategory && filteredBooks.length > 0 && (
          <Card className="mb-12 border-0 shadow-xl dark:shadow-gray-900/50">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Books in {selectedCategory.name} ({filteredBooks.length})
              </h2>
              <div className="space-y-4">
                {filteredBooks.map(
                  (
                    book // Use filteredBooks instead of books
                  ) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        {renderBookImage(book)}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {book.author}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {book.published_date
                              ? formatDate(book.published_date)
                              : "Year not available"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        View Book
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {books.length === 0 && !booksLoading && !loadingCategory && (
          <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-16">
            <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              No Books Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              {selectedCategory
                ? `No books found in the ${selectedCategory.name} category.`
                : "No books are currently available in the library."}
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh Library
            </Button>
          </Card>
        )}

        {/* Statistics */}
        <Card className="text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Collection Overview
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {totalBooks}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Books
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                {DEWEY_CATEGORIES.length + CHILDRENS_CATEGORIES.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Main Categories
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {categoryBooksCount.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Active Categories
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Digital Access
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, bookCount, onSelect }) => (
  <Card
    className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-xl dark:shadow-gray-800/50"
    onClick={() => onSelect(category)}
  >
    <div
      className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-xl sm:text-2xl mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
    >
      {category.icon}
    </div>

    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center mb-1 sm:mb-2">
      {category.number}
    </h3>

    <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 text-center mb-2 sm:mb-3">
      {category.name}
    </h4>

    <p className="text-gray-600 dark:text-gray-400 text-center text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
      {category.description}
    </p>

    <div className="flex justify-between items-center">
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {bookCount} {bookCount === 1 ? "book" : "books"}
      </span>
      <div className="flex items-center text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
        <span className="text-xs sm:text-sm font-medium">Explore</span>
        <FiChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </div>
  </Card>
);

export default BrowsePage;
