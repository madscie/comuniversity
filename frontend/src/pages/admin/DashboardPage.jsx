import React, { useState, useEffect } from 'react';
import { bookAPI } from '../../services/api';
import AddBookModal from '../../components/Modals/AddBookModal';
import BookReaderModal from '../../components/Modals/BookReaderModal'; // We'll create this

const DashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeUsers: 1287,
    newThisMonth: 0,
    searchesToday: 324,
  });

  /** Fetch books when component mounts */
  useEffect(() => {
    fetchBooks();
  }, []);

  /** Fetch all books and update stats */
  const fetchBooks = async () => {
    try {
      const booksData = await bookAPI.getAll();
      setBooks(booksData);
      setFilteredBooks(booksData);

      setStats((prev) => ({
        ...prev,
        totalBooks: booksData.length,
        newThisMonth: booksData.filter((book) => {
          const bookDate = new Date(book.created_at);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return bookDate > monthAgo;
        }).length,
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  /** Search handler */
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(
      (book) =>
        book.title?.toLowerCase().includes(query.toLowerCase()) ||
        book.author?.toLowerCase().includes(query.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(query.toLowerCase()) ||
        book.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  /** Add new book handler */
  const handleBookAdded = (newBook) => {
    setBooks((prev) => [...prev, newBook]);
    setFilteredBooks((prev) => [...prev, newBook]);
  };

  /** Open book reader */
  const handleReadBook = (book) => {
    setSelectedBook(book);
    setIsReaderModalOpen(true);
  };

  /** Get full image URL */
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3002${imagePath}`;
  };

  /** Get book file URL */
  const getBookFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    return `http://localhost:3002${filePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your library collection</p>
      </header>

      {/* Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Books', value: stats.totalBooks, change: '+12%' },
          { label: 'Active Users', value: stats.activeUsers, change: '+5%' },
          { label: 'New This Month', value: stats.newThisMonth, change: '+8%' },
          { label: 'Searches Today', value: stats.searchesToday, change: '-3%', isNegative: true },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            <p
              className={`text-sm ${
                item.isNegative ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {item.change} from last month
            </p>
          </div>
        ))}
      </section>

      {/* Search & Actions */}
      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search Input */}
          <div className="w-full sm:max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search books by title, author, ISBN, or category..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Add Book Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            + Add New Book
          </button>
        </div>
      </section>

      {/* Books List */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Books'}
          <span className="text-sm text-gray-600 ml-2">
            ({filteredBooks.length} books)
          </span>
        </h2>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery
                ? `No books found matching "${searchQuery}"`
                : 'No books available in the library'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleReadBook(book)}
              >
                {/* Book Cover Image */}
                <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {book.cover_image ? (
                    <img
                      src={getImageUrl(book.cover_image)}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        // Show fallback if image fails to load
                        const fallback = e.target.parentElement.querySelector('.image-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback when no image or image fails */}
                  <div 
                    className={`image-fallback text-gray-400 flex items-center justify-center w-full h-full ${book.cover_image ? 'hidden' : 'flex'}`}
                  >
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span className="text-sm">No Cover</span>
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                  {book.title || 'Untitled'}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  by {book.author || 'Unknown Author'}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {book.category || 'Uncategorized'}
                  </span>
                  <span className="text-sm text-gray-500">ISBN: {book.isbn || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {book.available_copies || 0} of {book.total_copies || 0} available
                  </span>
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent click
                      handleReadBook(book);
                    }}
                  >
                    Read Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />

      {/* Book Reader Modal */}
      {selectedBook && (
        <BookReaderModal
          isOpen={isReaderModalOpen}
          onClose={() => {
            setIsReaderModalOpen(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          bookFileUrl={getBookFileUrl(selectedBook.file_url)}
        />
      )}
    </div>
  );
};

export default DashboardPage;