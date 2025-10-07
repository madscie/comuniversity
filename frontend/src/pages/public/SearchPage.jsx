import React, { useState, useEffect } from 'react';
import { bookAPI, userService } from '../../services/api';
import BookReaderModal from '../../components/Modals/BookReaderModal';
import AdvancedSearchModal from '../../components/Search/AdvancedSearchModal';

const SearchPage = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [userLoans, setUserLoans] = useState([]);
  const [currentUser] = useState(userService.getCurrentUser());

  useEffect(() => {
    fetchAllBooks();
    if (currentUser) {
      fetchUserLoans();
    }
  }, [currentUser]);

  const fetchAllBooks = async () => {
    try {
      const booksData = await bookAPI.getAll();
      setBooks(booksData);
      setSearchResults(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchUserLoans = async () => {
    try {
      const loans = await bookAPI.getUserLoans(currentUser.id);
      setUserLoans(loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(books);
      return;
    }

    setIsLoading(true);
    try {
      const results = await bookAPI.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to client-side search if API search fails
      const filtered = books.filter(book =>
        book.title?.toLowerCase().includes(query.toLowerCase()) ||
        book.author?.toLowerCase().includes(query.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(query.toLowerCase()) ||
        book.category?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setIsLoading(false);
    }
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
      fetchAllBooks(); // Refresh book list
      fetchUserLoans(); // Refresh loans
    } catch (error) {
      alert('Error borrowing book: ' + error.message);
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      await bookAPI.returnBook(loanId);
      alert('Book returned successfully!');
      fetchAllBooks(); // Refresh book list
      fetchUserLoans(); // Refresh loans
    } catch (error) {
      alert('Error returning book: ' + error.message);
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Library</h1>
          <p className="text-gray-600">Find books by title, author, ISBN, or category</p>
        </div>

        {/* Search Input with Advanced Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search books by title, author, ISBN, or category..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                Advanced Search
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Books'}
            <span className="text-sm text-gray-600 ml-2">({searchResults.length} books found)</span>
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Searching books...</p>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-gray-600 text-lg">
                {searchQuery ? `No books found matching "${searchQuery}"` : 'No books available in the library'}
              </p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or browse all books</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map(book => {
                const isBorrowed = isBookBorrowedByUser(book.id);
                const userLoan = getBookLoan(book.id);
                
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
                      {isBorrowed && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Borrowed
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                      <h3 
                        className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                        onClick={() => handleReadBook(book)}
                      >
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
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleReadBook(book)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Read
                        </button>
                        
                        {isBorrowed ? (
                          <button
                            onClick={() => handleReturnBook(userLoan.id)}
                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Return
                          </button>
                        ) : book.available_copies > 0 ? (
                          <button
                            onClick={() => handleBorrowBook(book.id)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Borrow
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-gray-400 text-white py-2 px-3 rounded text-sm cursor-not-allowed"
                          >
                            Unavailable
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
        </div>

        {/* Modals */}
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
            setSearchResults(results);
            setSearchQuery('');
          }}
        />
      </div>
    </div>
  );
};

export default SearchPage;