// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { bookAPI, userService } from '../../services/api';
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

  useEffect(() => {
    // Get current user and set admin status
    const user = userService.getCurrentUser();
    setCurrentUser(user);
    setIsAdmin(user?.role === 'admin' || user?.role === 'librarian');
    
    fetchBooks();
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
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
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
      book.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleBookAdded = (newBook) => {
    setBooks(prev => [...prev, newBook]);
    setFilteredBooks(prev => [...prev, newBook]);
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks(prev => prev.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ));
    setFilteredBooks(prev => prev.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ));
  };

  const handleBookDeleted = (bookId) => {
    setBooks(prev => prev.filter(book => book.id !== bookId));
    setFilteredBooks(prev => prev.filter(book => book.id !== bookId));
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Library Dashboard</h1>
            {isAdmin && (
              <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium">
                Admin Mode
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setCurrentView('books')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'books' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border'
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setCurrentView('loans')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'loans' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border'
              }`}
            >
              My Loans ({userLoans.filter(l => l.status === 'active').length})
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'admin' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-gray-700 border'
                }`}
              >
                Admin Tools
              </button>
            )}
          </div>
        </div>

        {/* Books View */}
        {currentView === 'books' && (
          <>
            {/* Search & Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-4 flex-1 max-w-2xl">
                  <input
                    type="text"
                    placeholder="Search books by title, author, ISBN, or category..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Advanced
                  </button>
                </div>
                
                {/* ADD BOOK BUTTON - FIXED CONDITIONAL RENDERING */}
                {isAdmin && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    + Add New Book
                  </button>
                )}
              </div>
              
              {/* DEBUG INFO - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Debug Info:</strong> isAdmin: {isAdmin.toString()}, 
                    User Role: {currentUser?.role || 'No user'}
                  </p>
                </div>
              )}
            </div>

            {/* Books Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Loading books...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => {
                  const isBorrowed = isBookBorrowedByUser(book.id);
                  const userLoan = getBookLoan(book.id);
                  
                  return (
                    <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Book Cover with Admin Badge */}
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
                        {isBorrowed && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            Borrowed
                          </div>
                        )}
                        {isAdmin && (
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
                          <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                          {isBorrowed && userLoan && (
                            <p className="text-xs text-orange-600 mt-1">
                              Due: {new Date(userLoan.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && <AnalyticsDashboard />}

        {/* Loans View */}
        {currentView === 'loans' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Borrowed Books</h2>
            {userLoans.length === 0 ? (
              <p className="text-gray-600">You haven't borrowed any books yet.</p>
            ) : (
              <div className="space-y-4">
                {userLoans.map(loan => (
                  <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {loan.cover_image && (
                        <img
                          src={getImageUrl(loan.cover_image)}
                          alt={loan.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{loan.title}</h3>
                        <p className="text-gray-600">by {loan.author}</p>
                        <p className="text-sm text-gray-500">
                          Borrowed: {new Date(loan.borrowed_date).toLocaleDateString()}
                        </p>
                        <p className={`text-sm ${
                          loan.status === 'active' && new Date(loan.due_date) < new Date()
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-600'
                        }`}>
                          Due: {new Date(loan.due_date).toLocaleDateString()}
                          {loan.status === 'active' && new Date(loan.due_date) < new Date() && (
                            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Overdue</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {loan.status === 'active' && (
                      <button
                        onClick={() => handleReturnBook(loan.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                      >
                        Return
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