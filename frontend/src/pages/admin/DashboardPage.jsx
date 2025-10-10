// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { bookAPI, userService, getContentTypes } from '../../services/api';
import AddBookModal from '../../components/Modals/AddBookModal';
import EditBookModal from '../../components/Modals/EditBookModal';
import BookReaderModal from '../../components/Modals/BookReaderModal';
import AdvancedSearchModal from '../../components/Search/AdvancedSearchModal';
import AnalyticsDashboard from '../../components/Analytics/AnalyticsDashboard';
import AdminTools from './AdminTools';

const DashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentView, setCurrentView] = useState('books');
  const [userLoans, setUserLoans] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentTypes, setContentTypes] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    childrenBooks: 0,
    articles: 0
  });

  useEffect(() => {
    const user = userService.getCurrentUser();
    setCurrentUser(user);
    setIsAdmin(user?.role === 'admin' || user?.role === 'librarian');
    
    fetchBooks();
    loadContentTypes();
    if (user) {
      fetchUserLoans(user.id);
    }
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const booksData = await bookAPI.getAll();
      setBooks(booksData);
      setFilteredBooks(booksData);
      calculateStats(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContentTypes = async () => {
    try {
      const types = await getContentTypes();
      setContentTypes(types);
    } catch (error) {
      console.error('Error loading content types:', error);
    }
  };

  const fetchUserLoans = async (userId) => {
    try {
      const loans = await bookAPI.getUserLoans(userId);
      setUserLoans(loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const calculateStats = (booksData) => {
    const totalBooks = booksData.length;
    const availableBooks = booksData.filter(book => book.available_copies > 0).length;
    const borrowedBooks = userLoans.filter(loan => loan.status === 'active').length;
    const childrenBooks = booksData.filter(book => 
      book.content_type === 'children' || book.age_group || book.reading_level
    ).length;
    const articles = booksData.filter(book => 
      book.content_type === 'article' || book.journal_name
    ).length;

    setStats({
      totalBooks,
      availableBooks,
      borrowedBooks,
      childrenBooks,
      articles
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(book =>
      book.title?.toLowerCase().includes(query.toLowerCase()) ||
      book.author?.toLowerCase().includes(query.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(query.toLowerCase()) ||
      book.category?.toLowerCase().includes(query.toLowerCase()) ||
      book.publisher?.toLowerCase().includes(query.toLowerCase()) ||
      book.journal_name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleBookAdded = (newBook) => {
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
    calculateStats(updatedBooks);
  };

  const handleBookUpdated = (updatedBook) => {
    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    );
    setBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
    calculateStats(updatedBooks);
  };

  const handleBookDeleted = (bookId) => {
    const updatedBooks = books.filter(book => book.id !== bookId);
    setBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
    calculateStats(updatedBooks);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleReadBook = (book) => {
    setSelectedBook(book);
    setIsReaderModalOpen(true);
  };

  const handleBorrowBook = async (bookId) => {
    if (!currentUser) {
      alert('Please log in to borrow books');
      return;
    }

    try {
      await bookAPI.borrowBook({
        user_id: currentUser.id,
        book_id: bookId,
        days: 14
      });
      alert('Book borrowed successfully!');
      fetchBooks();
      fetchUserLoans(currentUser.id);
    } catch (error) {
      alert('Error borrowing book: ' + error.message);
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      await bookAPI.returnBook(loanId);
      alert('Book returned successfully!');
      fetchBooks();
      fetchUserLoans(currentUser.id);
    } catch (error) {
      alert('Error returning book: ' + error.message);
    }
  };

  const handleDownloadBook = async (book) => {
    if (!book.file_url) {
      alert('No digital version available for download');
      return;
    }

    try {
      const response = await fetch(getBookFileUrl(book.file_url));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Download started!');
    } catch (error) {
      alert('Error downloading book: ' + error.message);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3002${imagePath}`;
  };

  const getBookFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    return `http://localhost:3002${filePath}`;
  };

  const isBookBorrowedByUser = (bookId) => {
    return userLoans.some(loan => loan.book_id === bookId && loan.status === 'active');
  };

  const getBookLoan = (bookId) => {
    return userLoans.find(loan => loan.book_id === bookId && loan.status === 'active');
  };

  const getBooksByContentType = (type) => {
    return filteredBooks.filter(book => {
      if (type === 'children') {
        return book.content_type === 'children' || book.age_group || book.reading_level;
      }
      if (type === 'article') {
        return book.content_type === 'article' || book.journal_name;
      }
      if (type === 'journal') {
        return book.content_type === 'journal';
      }
      if (type === 'thesis') {
        return book.content_type === 'thesis';
      }
      if (type === 'report') {
        return book.content_type === 'report';
      }
      return book.content_type === type || (!book.content_type && type === 'book');
    });
  };

  const renderBookCard = (book, options = {}) => {
    const isBorrowed = isBookBorrowedByUser(book.id);
    const userLoan = getBookLoan(book.id);
    const {
      showAdminBadge = true,
      showChildrenBadge = false,
      showArticleBadge = false,
      customBadge = null
    } = options;

    return (
      <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
        {/* Book Cover */}
        <div 
          className="h-48 bg-gray-200 flex items-center justify-center cursor-pointer relative"
          onClick={() => handleReadBook(book)}
        >
          {book.cover_image ? (
            <img
              src={getImageUrl(book.cover_image)}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm">No Cover Image</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isBorrowed && (
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                Borrowed
              </div>
            )}
            {showChildrenBadge && (
              <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                Children
              </div>
            )}
            {showArticleBadge && (
              <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                Article
              </div>
            )}
            {customBadge}
          </div>
          
          {showAdminBadge && isAdmin && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              Admin
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleReadBook(book)}>
            {book.title}
          </h3>
          <p className="text-gray-600 mb-2 text-sm">by {book.author}</p>
          
          {/* Content Specific Info */}
          {(book.age_group || book.reading_level) && (
            <div className="space-y-1 mb-2">
              {book.age_group && (
                <div className="flex items-center text-xs text-blue-600">
                  <span className="font-medium">Age:</span>
                  <span className="ml-1">{book.age_group}</span>
                </div>
              )}
              {book.reading_level && (
                <div className="flex items-center text-xs text-green-600">
                  <span className="font-medium">Level:</span>
                  <span className="ml-1">{book.reading_level}</span>
                </div>
              )}
            </div>
          )}

          {(book.journal_name || book.volume) && (
            <div className="space-y-1 mb-2">
              {book.journal_name && (
                <div className="flex items-center text-xs text-purple-600">
                  <span className="font-medium">Journal:</span>
                  <span className="ml-1 line-clamp-1">{book.journal_name}</span>
                </div>
              )}
              {book.volume && (
                <div className="flex items-center text-xs text-gray-600">
                  <span className="font-medium">Vol:</span>
                  <span className="ml-1">{book.volume}</span>
                  {book.issue && <span className="ml-1">({book.issue})</span>}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs px-2 py-1 rounded ${
              book.available_copies > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {book.available_copies}/{book.total_copies} available
            </span>
            {book.category && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {book.category}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleReadBook(book)}
              className="flex-1 bg-blue-600 text-white py-2 px-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Read
            </button>
            
            {book.file_url && (
              <button
                onClick={() => handleDownloadBook(book)}
                className="flex-1 bg-purple-600 text-white py-2 px-2 rounded text-sm hover:bg-purple-700 transition-colors"
              >
                Download
              </button>
            )}
            
            {isBorrowed ? (
              <button
                onClick={() => handleReturnBook(userLoan.id)}
                className="flex-1 bg-red-600 text-white py-2 px-2 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Return
              </button>
            ) : book.available_copies > 0 ? (
              <button
                onClick={() => handleBorrowBook(book.id)}
                className="flex-1 bg-green-600 text-white py-2 px-2 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Borrow
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-gray-400 text-white py-2 px-2 rounded text-sm cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
            
            {isAdmin && (
              <button
                onClick={() => handleEditBook(book)}
                className="flex-1 bg-yellow-600 text-white py-2 px-2 rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">ISBN: {book.isbn || 'N/A'}</p>
            {book.publisher && (
              <p className="text-xs text-gray-500">Publisher: {book.publisher}</p>
            )}
            {isBorrowed && userLoan && (
              <p className="text-xs text-orange-600 mt-1">
                Due: {new Date(userLoan.due_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Books</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalBooks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Available</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.availableBooks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Children's</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.childrenBooks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Articles</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.articles}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex items-center">
          <div className="bg-red-100 p-3 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">My Loans</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.borrowedBooks}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Library Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentUser?.name || 'User'}!</p>
            </div>
            {isAdmin && (
              <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium">
                Admin Mode
              </span>
            )}
          </div>

          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 bg-white rounded-lg shadow p-4">
            <button
              onClick={() => setCurrentView('books')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'books' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              📚 All Books
            </button>
            <button
              onClick={() => setCurrentView('children')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'children' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              🧒 Children's Section
            </button>
            <button
              onClick={() => setCurrentView('articles')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'articles' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              📄 Articles & Journals
            </button>
            <button
              onClick={() => setCurrentView('academic')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'academic' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              🎓 Academic Works
            </button>
            <button
              onClick={() => setCurrentView('loans')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'loans' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              📋 My Loans ({userLoans.filter(l => l.status === 'active').length})
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'analytics' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              📊 Analytics
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'admin' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                ⚙️ Admin Tools
              </button>
            )}
          </div>
        </div>

        {/* Main Content Views */}
        <div className="space-y-6">
          {/* All Books View */}
          {currentView === 'books' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Library Content</h2>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    + Add New Content
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search books, articles, journals by title, author, ISBN, or category..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Advanced Search
                  </button>
                </div>
              </div>

              {/* Books Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Loading content...</p>
                  </div>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-gray-600 text-lg">
                    {searchQuery ? `No content found matching "${searchQuery}"` : 'No content available'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map(book => renderBookCard(book))}
                </div>
              )}
            </div>
          )}

          {/* Children's Section View */}
          {currentView === 'children' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Children's Section</h2>
                  <p className="text-gray-600">Books and materials for young readers</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    + Add Children's Book
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Loading children's books...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getBooksByContentType('children').map(book => 
                    renderBookCard(book, { showChildrenBadge: true })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Articles & Journals View */}
          {currentView === 'articles' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Articles & Journals</h2>
                  <p className="text-gray-600">Academic papers and journal publications</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    + Add Article/Journal
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Loading articles...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getBooksByContentType('article').map(book => 
                    renderBookCard(book, { showArticleBadge: true })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Academic Works View */}
          {currentView === 'academic' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Academic Works</h2>
                  <p className="text-gray-600">Theses, dissertations, and research reports</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    + Add Academic Work
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Loading academic works...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Theses */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Theses & Dissertations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getBooksByContentType('thesis').map(book => 
                        renderBookCard(book, { 
                          customBadge: <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">Thesis</div>
                        })
                      )}
                    </div>
                  </div>

                  {/* Reports */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getBooksByContentType('report').map(book => 
                        renderBookCard(book, { 
                          customBadge: <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Report</div>
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics View */}
          {currentView === 'analytics' && <AnalyticsDashboard books={books} />}

          {/* Loans View */}
          {currentView === 'loans' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Borrowed Books</h2>
              {userLoans.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-600 text-lg">You haven't borrowed any books yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Browse our collection to find something interesting!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userLoans.map(loan => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        {loan.cover_image ? (
                          <img
                            src={getImageUrl(loan.cover_image)}
                            alt={loan.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{loan.title}</h3>
                          <p className="text-gray-600">by {loan.author}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <p className="text-gray-500">
                              Borrowed: {new Date(loan.borrowed_date).toLocaleDateString()}
                            </p>
                            <p className={`${
                              loan.status === 'active' && new Date(loan.due_date) < new Date()
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-600'
                            }`}>
                              Due: {new Date(loan.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          {loan.status === 'active' && new Date(loan.due_date) < new Date() && (
                            <span className="inline-block mt-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Overdue</span>
                          )}
                        </div>
                      </div>
                      
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleReturnBook(loan.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Return Book
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin Tools View */}
          {currentView === 'admin' && isAdmin && (
            <AdminTools 
              books={books}
              onBookAdded={handleBookAdded}
              onBookUpdated={handleBookUpdated}
              onBookDeleted={handleBookDeleted}
              onEditBook={handleEditBook}
            />
          )}
        </div>

        {/* Modals */}
        <AddBookModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onBookAdded={handleBookAdded}
        />

        <EditBookModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          onBookUpdated={handleBookUpdated}
          onBookDeleted={handleBookDeleted}
        />

        <BookReaderModal
          isOpen={isReaderModalOpen}
          onClose={() => {
            setIsReaderModalOpen(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          bookFileUrl={selectedBook ? getBookFileUrl(selectedBook.file_url) : null}
        />

        <AdvancedSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearchResults={(results) => {
            setFilteredBooks(results);
            setSearchQuery('');
          }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;