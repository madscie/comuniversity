import { useEffect, useState } from "react";
import {
  FiDownload,
  FiBook,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiClock,
  FiHeart,
  FiBookmark,
  FiShare2,
  FiEye,
  FiChevronDown,
  FiStar,
  FiCalendar,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { BookCard } from "../../components/Books/BookCard";
import { bookService } from "../../services/bookService";
import { readingService } from "../../services/readingService";
import { formatDate } from "../../utils/dateHelper";
import { componentClasses } from "../../components/UI/TailwindColors";

// Enhanced Loading Spinner
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
      {message}
    </p>
  </div>
);

const MyLibraryPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLibraryData();
    }
  }, [isAuthenticated]);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const favorites = readingService.getFavorites();
      const booksResponse = await bookService.getBooks();

      if (booksResponse.success) {
        const booksWithFavorites = (booksResponse.data.books || []).map(
          (book) => ({
            ...book,
            isFavorite: favorites.includes(book.id),
            progress: readingService.getReadingProgress(book.id) ? 50 : 0,
          })
        );

        setBooks(booksWithFavorites);
      }

      setReadingHistory([]);
    } catch (err) {
      console.error("Error loading library data:", err);
      setError("Failed to load your library. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (bookId) => {
    try {
      const newFavoriteStatus = readingService.toggleFavorite(bookId);
      setBooks(
        books.map((book) =>
          book.id === bookId ? { ...book, isFavorite: newFavoriteStatus } : book
        )
      );
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

  const handleDownload = async (bookId, format = "PDF") => {
    try {
      console.log(`Downloading book ${bookId} in ${format} format`);
      alert(
        "Download functionality will be implemented with backend integration."
      );
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }
  };

  const handleReadOnline = (bookId) => {
    window.location.href = `/books/${bookId}`;
  };

  // Filter and sort books
  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;

      if (activeTab === "favorites") {
        return matchesSearch && matchesCategory && book.isFavorite;
      }
      if (activeTab === "reading") {
        return (
          matchesSearch &&
          matchesCategory &&
          book.progress > 0 &&
          book.progress < 100
        );
      }
      if (activeTab === "unread") {
        return matchesSearch && matchesCategory && book.progress === 0;
      }

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "rating":
          return b.rating - a.rating;
        case "recent":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const categories = [
    "all",
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ];
  const totalBooks = books.length;
  const totalPages = books.reduce((sum, book) => sum + (book.pages || 0), 0);
  const readingProgress = books.filter((book) => book.progress > 0).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center max-w-md mx-auto p-8">
          <FiBook className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Your Library
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to view your personal library and reading history.
          </p>
          <button
            className={`${componentClasses.btn.primary} px-6 py-3 font-medium`}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <LoadingSpinner message="Loading your library..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
              <FiBook className="mr-3 text-green-600 dark:text-green-400" /> My
              Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name || "Reader"}! Continue your learning
              journey.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBooks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Books
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {readingProgress}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                In Progress
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={fetchLibraryData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium mt-2 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FiBook className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Pages
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {totalPages.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FiClock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reading Time
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {(totalPages * 2).toLocaleString()} min
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FiStar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Favorites
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {books.filter((b) => b.isFavorite).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: "all", label: "All Books", count: books.length },
              {
                id: "reading",
                label: "Reading",
                count: books.filter((b) => b.progress > 0 && b.progress < 100)
                  .length,
              },
              {
                id: "favorites",
                label: "Favorites",
                count: books.filter((b) => b.isFavorite).length,
              },
              {
                id: "unread",
                label: "Unread",
                count: books.filter((b) => b.progress === 0).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="rating">Rating</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors duration-200 ${
                  viewMode === "grid"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors duration-200 ${
                  viewMode === "list"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <FiBook className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {books.length === 0 ? "Your library is empty" : "No books found"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {books.length === 0
              ? "Start building your library by purchasing books from our collection"
              : "Try adjusting your search or filters"}
          </p>
          {searchQuery || selectedCategory !== "all" || activeTab !== "all" ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setActiveTab("all");
              }}
              className={`${componentClasses.btn.primary} px-6 py-2 font-medium`}
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => (window.location.href = "/browse")}
              className={`${componentClasses.btn.primary} px-6 py-2 font-medium`}
            >
              Browse Collection
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onToggleFavorite={toggleFavorite}
              onDownload={handleDownload}
              onReadOnline={handleReadOnline}
              showProgress={true}
            />
          ))}
        </div>
      )}

      {/* Reading History Section */}
      {readingHistory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <FiClock className="mr-2 text-green-600 dark:text-green-400" />{" "}
            Reading History
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {readingHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      By {item.author}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <FiCalendar className="mr-1" />
                      Last read: {formatDate(item.lastRead)}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Page {item.currentPage} • {item.progress}% complete
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLibraryPage;
