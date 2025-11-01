// src/pages/public/MyLibraryPage.jsx
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
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

// Enhanced sample data with more properties
const sampleLibraryData = {
  purchased: [
    {
      id: 1,
      title: "Introduction to Artificial Intelligence",
      author: "John McCarthy",
      cover:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
      downloadUrl: "#",
      category: "Technology",
      format: "PDF",
      fileSize: "4.2 MB",
      pages: 320,
      rating: 4.5,
      downloadCount: 1247,
      addedDate: "2024-01-15",
      lastRead: "2024-03-20",
      progress: 75,
      isFavorite: true,
      tags: ["AI", "Machine Learning", "Computer Science"],
    },
    {
      id: 2,
      title: "Modern Web Development with React",
      author: "Dan Abramov",
      cover:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop",
      downloadUrl: "#",
      category: "Web Development",
      format: "EPUB",
      fileSize: "3.1 MB",
      pages: 280,
      rating: 4.8,
      downloadCount: 2891,
      addedDate: "2024-02-10",
      lastRead: "2024-03-18",
      progress: 45,
      isFavorite: false,
      tags: ["React", "JavaScript", "Frontend"],
    },
    {
      id: 3,
      title: "Deep Learning Fundamentals",
      author: "Ian Goodfellow",
      cover:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=600&fit=crop",
      downloadUrl: "#",
      category: "Machine Learning",
      format: "PDF",
      fileSize: "5.7 MB",
      pages: 450,
      rating: 4.7,
      downloadCount: 1876,
      addedDate: "2024-01-28",
      lastRead: "2024-03-15",
      progress: 20,
      isFavorite: true,
      tags: ["Deep Learning", "Neural Networks", "AI"],
    },
    {
      id: 4,
      title: "Clean Code Architecture",
      author: "Robert C. Martin",
      cover:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
      downloadUrl: "#",
      category: "Software Engineering",
      format: "PDF",
      fileSize: "2.8 MB",
      pages: 310,
      rating: 4.6,
      downloadCount: 3256,
      addedDate: "2024-03-01",
      lastRead: null,
      progress: 0,
      isFavorite: false,
      tags: ["Programming", "Best Practices", "Architecture"],
    },
  ],
  readingHistory: [
    {
      id: 5,
      title: "The Psychology of Programming",
      author: "Gerald M. Weinberg",
      cover:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
      lastRead: "2024-03-19",
      progress: 60,
      currentPage: 180,
    },
  ],
};

const MyLibraryPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API fetch
      setLoading(true);
      setTimeout(() => {
        setBooks(sampleLibraryData.purchased);
        setReadingHistory(sampleLibraryData.readingHistory);
        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated]);

  // Filter and sort books
  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
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
          return new Date(b.addedDate) - new Date(a.addedDate);
      }
    });

  const categories = ["all", ...new Set(books.map((book) => book.category))];
  const totalBooks = books.length;
  const totalPages = books.reduce((sum, book) => sum + book.pages, 0);
  const readingProgress = books.filter((book) => book.progress > 0).length;

  const toggleFavorite = (bookId) => {
    setBooks(
      books.map((book) =>
        book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
      )
    );
  };

  const updateProgress = (bookId, progress) => {
    setBooks(
      books.map((book) => (book.id === bookId ? { ...book, progress } : book))
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center max-w-md mx-auto p-6 sm:p-8">
          <FiBook className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Your Library
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
            Please log in to view your personal library and reading history.
          </p>
          <Button className="text-sm sm:text-base">Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 sm:w-1/4 mb-4 sm:mb-6"></div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-lg h-60 sm:h-80"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center mb-1 sm:mb-2">
              <FiBook className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />{" "}
              My Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Welcome back, {user?.name || "Reader"}! Continue your learning
              journey.
            </p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 mt-3 sm:mt-0">
            <div className="text-right">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {totalBooks}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Total Books
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {readingProgress}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                In Progress
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-4 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FiBook className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Total Pages
                </p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {totalPages.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FiClock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Reading Time
                </p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {(totalPages * 2).toLocaleString()} min
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FiStar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Favorites
                </p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {books.filter((b) => b.isFavorite).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Controls Section */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6 dark:shadow-gray-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 sm:space-y-4 lg:space-y-0">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
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
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none min-w-0 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(" ")[0]}</span>
                <span className="ml-1">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none sm:w-48 lg:w-56">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Books Grid/List */}
      {filteredBooks.length === 0 ? (
        <Card className="text-center py-8 sm:py-12 dark:shadow-gray-900/50">
          <FiBook className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
            No books found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto px-2">
            {searchQuery || selectedCategory !== "all" || activeTab !== "all"
              ? "Try adjusting your search or filters"
              : "Start building your library by purchasing books from our collection"}
          </p>
          {searchQuery || selectedCategory !== "all" || activeTab !== "all" ? (
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setActiveTab("all");
              }}
              className="text-sm sm:text-base"
            >
              Clear Filters
            </Button>
          ) : (
            <Button className="text-sm sm:text-base">Browse Collection</Button>
          )}
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden dark:shadow-gray-900/50">
          {filteredBooks.map((book) => (
            <BookListItem
              key={book.id}
              book={book}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </Card>
      )}

      {/* Reading History Section */}
      {readingHistory.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <FiClock className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />{" "}
            Reading History
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {readingHistory.map((item) => (
              <Card
                key={item.id}
                className="p-3 sm:p-4 dark:shadow-gray-900/50"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-12 h-16 sm:w-16 sm:h-24 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                      By {item.author}
                    </p>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      <FiCalendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      Last read: {new Date(item.lastRead).toLocaleDateString()}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mb-1">
                      <div
                        className="bg-green-600 dark:bg-green-400 h-1.5 sm:h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Page {item.currentPage} • {item.progress}% complete
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Book Card Component for Grid View
const BookCard = ({ book, onToggleFavorite }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group dark:shadow-gray-900/50">
    <div className="relative">
      <img
        src={book.cover}
        alt={book.title}
        className="w-full h-48 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onToggleFavorite(book.id)}
          className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm ${
            book.isFavorite
              ? "bg-red-500 text-white"
              : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white"
          } transition-colors`}
        >
          <FiHeart className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        <button className="p-1.5 sm:p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white transition-colors">
          <FiShare2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
      {book.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/50 text-white p-2">
          <div className="w-full bg-gray-600 rounded-full h-1 sm:h-1.5">
            <div
              className="bg-green-500 h-1 sm:h-1.5 rounded-full"
              style={{ width: `${book.progress}%` }}
            ></div>
          </div>
          <div className="text-xs mt-1">{book.progress}% read</div>
        </div>
      )}
    </div>

    <div className="p-3 sm:p-4">
      <div className="flex items-start justify-between mb-1 sm:mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
            By {book.author}
          </p>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-yellow-600 dark:text-yellow-500 ml-2 flex-shrink-0">
          <FiStar className="fill-current mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          {book.rating}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
        {book.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
          >
            {tag}
          </span>
        ))}
        {book.tags.length > 2 && (
          <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
            +{book.tags.length - 2}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
        <span>{book.format}</span>
        <span>{book.fileSize}</span>
        <span>{book.pages} pages</span>
      </div>

      <div className="flex space-x-1 sm:space-x-2">
        <a
          href={book.downloadUrl}
          className="flex-1 inline-flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm rounded-lg transition-colors"
        >
          <FiDownload className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Download
        </a>
        <button className="p-1.5 sm:p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <FiEye className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  </Card>
);

// Book List Item Component for List View
const BookListItem = ({ book, onToggleFavorite }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div className="p-3 sm:p-4">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <img
          src={book.cover}
          alt={book.title}
          className="w-16 h-20 sm:w-20 sm:h-28 object-cover rounded-lg flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1 sm:mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                {book.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                By {book.author}
              </p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-0">
              <button
                onClick={() => onToggleFavorite(book.id)}
                className={`p-1.5 sm:p-2 rounded-lg ${
                  book.isFavorite
                    ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                } transition-colors`}
              >
                <FiHeart className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiShare2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
            <span className="flex items-center">
              <FiStar className="fill-current text-yellow-500 mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              {book.rating}
            </span>
            <span>{book.category}</span>
            <span>{book.format}</span>
            <span>{book.fileSize}</span>
            <span>{book.pages} pages</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {book.progress > 0 && (
            <div className="mb-2 sm:mb-3">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Reading Progress</span>
                <span>{book.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div
                  className="bg-green-600 dark:bg-green-400 h-1.5 sm:h-2 rounded-full"
                  style={{ width: `${book.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1 sm:gap-2">
            <a
              href={book.downloadUrl}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm rounded-lg transition-colors"
            >
              <FiDownload className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Download
            </a>
            <button className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FiEye className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Read Online
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MyLibraryPage;
