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
  FiCalendar
} from "react-icons/fi";
import { useAuthStore } from "../../store/clerkAuthStore";

const MyLibraryPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('all');
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
      
      // TODO: Replace with actual API calls
      // const libraryResponse = await libraryAPI.getUserLibrary();
      // const historyResponse = await libraryAPI.getReadingHistory();
      
      // For now, set empty arrays until backend is ready
      setBooks([]);
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
      // TODO: Replace with actual API call
      // await libraryAPI.toggleFavorite(bookId);
      
      // Temporary UI update
      setBooks(books.map(book => 
        book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
      ));
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

  const handleDownload = async (bookId, format = "PDF") => {
    try {
      // TODO: Replace with actual API call
      // const response = await downloadAPI.downloadBook(bookId, format);
      // Handle download response
      
      console.log(`Downloading book ${bookId} in ${format} format`);
      alert("Download functionality will be implemented with backend integration.");
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }
  };

  const handleReadOnline = (bookId) => {
    // TODO: Implement read online functionality
    console.log("Read online:", bookId);
    alert("Read online functionality will be implemented with backend integration.");
  };

  // Filter and sort books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (book.tags && book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    
    if (activeTab === 'favorites') {
      return matchesSearch && matchesCategory && book.isFavorite;
    }
    if (activeTab === 'reading') {
      return matchesSearch && matchesCategory && book.progress > 0 && book.progress < 100;
    }
    if (activeTab === 'unread') {
      return matchesSearch && matchesCategory && book.progress === 0;
    }
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
      default:
        return new Date(b.addedDate) - new Date(a.addedDate);
    }
  });

  const categories = ['all', ...new Set(books.map(book => book.category))];
  const totalBooks = books.length;
  const totalPages = books.reduce((sum, book) => sum + (book.pages || 0), 0);
  const readingProgress = books.filter(book => book.progress > 0).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <FiBook className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Your Library</h2>
          <p className="text-gray-600 mb-6">Please log in to view your personal library and reading history.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
              <FiBook className="mr-3 text-blue-600" /> My Library
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.name || 'Reader'}! Continue your learning journey.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{totalBooks}</div>
              <div className="text-sm text-gray-600">Total Books</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{readingProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchLibraryData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium mt-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBook className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-xl font-semibold">{totalPages.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiClock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Reading Time</p>
                <p className="text-xl font-semibold">{(totalPages * 2).toLocaleString()} min</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiStar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-xl font-semibold">{books.filter(b => b.isFavorite).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'all', label: 'All Books', count: books.length },
              { id: 'reading', label: 'Reading', count: books.filter(b => b.progress > 0 && b.progress < 100).length },
              { id: 'favorites', label: 'Favorites', count: books.filter(b => b.isFavorite).length },
              { id: 'unread', label: 'Unread', count: books.filter(b => b.progress === 0).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="rating">Rating</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <FiBook className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {books.length === 0 ? "Your library is empty" : "No books found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {books.length === 0 
              ? "Start building your library by purchasing books from our collection"
              : "Try adjusting your search or filters"
            }
          </p>
          {searchQuery || selectedCategory !== 'all' || activeTab !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveTab('all');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Clear Filters
            </button>
          ) : (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
              Browse Collection
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onToggleFavorite={toggleFavorite}
              onDownload={handleDownload}
              onReadOnline={handleReadOnline}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredBooks.map((book) => (
            <BookListItem 
              key={book.id} 
              book={book} 
              onToggleFavorite={toggleFavorite}
              onDownload={handleDownload}
              onReadOnline={handleReadOnline}
            />
          ))}
        </div>
      )}

      {/* Reading History Section */}
      {readingHistory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiClock className="mr-2 text-blue-600" /> Reading History
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {readingHistory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">By {item.author}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FiCalendar className="mr-1" />
                      Last read: {new Date(item.lastRead).toLocaleDateString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
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

// Book Card Component for Grid View
const BookCard = ({ book, onToggleFavorite, onDownload, onReadOnline }) => (
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200 group">
    <div className="relative">
      <img
        src={book.coverImage}
        alt={book.title}
        className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onToggleFavorite(book.id)}
          className={`p-2 rounded-full backdrop-blur-sm ${
            book.isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
          } transition-colors`}
        >
          <FiHeart className="h-4 w-4" />
        </button>
        <button className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors">
          <FiShare2 className="h-4 w-4" />
        </button>
      </div>
      {book.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/50 text-white p-2">
          <div className="w-full bg-gray-600 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${book.progress}%` }}
            ></div>
          </div>
          <div className="text-xs mt-1">{book.progress}% read</div>
        </div>
      )}
    </div>
    
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">By {book.author}</p>
        </div>
        <div className="flex items-center text-sm text-yellow-600 ml-2">
          <FiStar className="fill-current mr-1" />
          {book.rating}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {book.tags?.slice(0, 2).map(tag => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {tag}
          </span>
        ))}
        {book.tags?.length > 2 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{book.tags.length - 2}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{book.format}</span>
        <span>{book.fileSize}</span>
        <span>{book.pages} pages</span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onDownload(book.id, "PDF")}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiDownload className="mr-1" /> Download
        </button>
        <button 
          onClick={() => onReadOnline(book.id)}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiEye className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

// Book List Item Component for List View
const BookListItem = ({ book, onToggleFavorite, onDownload, onReadOnline }) => (
  <div className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
    <div className="p-4">
      <div className="flex items-start space-x-4">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg truncate">{book.title}</h3>
              <p className="text-sm text-gray-600">By {book.author}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onToggleFavorite(book.id)}
                className={`p-2 rounded-lg ${
                  book.isFavorite 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                } transition-colors`}
              >
                <FiHeart className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                <FiShare2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center">
              <FiStar className="fill-current text-yellow-500 mr-1" />
              {book.rating}
            </span>
            <span>{book.category}</span>
            <span>{book.format}</span>
            <span>{book.fileSize}</span>
            <span>{book.pages} pages</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {book.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>

          {book.progress > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Reading Progress</span>
                <span>{book.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${book.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => onDownload(book.id, "PDF")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiDownload className="mr-2" /> Download
            </button>
            <button 
              onClick={() => onReadOnline(book.id)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiEye className="mr-2" /> Read Online
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MyLibraryPage;