// src/pages/public/MyBooksPage.jsx
import { useState, useEffect } from "react";
import {
  FiBook,
  FiPlus,
  FiSearch,
  FiClock,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const MyBooksPage = () => {
  const [readingList, setReadingList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load reading list from localStorage
    const loadReadingList = () => {
      setLoading(true);
      setTimeout(() => {
        const savedList = JSON.parse(
          localStorage.getItem("readingList") || "[]"
        );
        setReadingList(savedList);
        setLoading(false);
      }, 1000);
    };

    loadReadingList();
  }, []);

  const filteredBooks = readingList.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeFromList = (bookId) => {
    const updatedList = readingList.filter((book) => book.id !== bookId);
    setReadingList(updatedList);
    localStorage.setItem("readingList", JSON.stringify(updatedList));
  };

  const updateReadingProgress = (bookId, progress) => {
    const updatedList = readingList.map((book) =>
      book.id === bookId ? { ...book, progress } : book
    );
    setReadingList(updatedList);
    localStorage.setItem("readingList", JSON.stringify(updatedList));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-6 sm:py-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading your reading list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-4 sm:py-6 lg:py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Reading List
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">Books you want to read</p>
          </div>
          <Button 
            onClick={() => (window.location.href = "/browse")}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add More Books
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4 text-center dark:shadow-gray-900/50">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {readingList.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Books</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center dark:shadow-gray-900/50">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {readingList.filter((book) => book.progress > 0).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center dark:shadow-gray-900/50">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {readingList.filter((book) => book.progress === 100).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-3 sm:p-4 mb-4 sm:mb-6 dark:shadow-gray-900/50">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your reading list..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Books List */}
        {filteredBooks.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="p-4 sm:p-6 dark:shadow-gray-900/50">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-3 sm:space-x-4 flex-1">
                    <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBook className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                        by {book.author}
                      </p>

                      {/* Reading Progress */}
                      <div className="mb-2 sm:mb-3">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{book.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                          <div
                            className="bg-green-600 dark:bg-green-400 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateReadingProgress(
                              book.id,
                              Math.min(100, (book.progress || 0) + 25)
                            )
                          }
                          className="text-xs sm:text-sm"
                        >
                          <FiClock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Update Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            (window.location.href = `/books/${book.id}`)
                          }
                          className="text-xs sm:text-sm"
                        >
                          <FiEye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromList(book.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 sm:p-2 flex-shrink-0"
                  >
                    <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8 sm:py-12 dark:shadow-gray-900/50">
            <FiBook className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {readingList.length === 0
                ? "Your reading list is empty"
                : "No books found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto px-2">
              {readingList.length === 0
                ? "Start building your reading list by browsing our collection!"
                : "Try adjusting your search terms."}
            </p>
            <Button 
              onClick={() => (window.location.href = "/browse")}
              className="text-sm sm:text-base"
            >
              Browse Books
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyBooksPage;