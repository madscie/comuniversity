// pages/books/MyBooksPage.jsx
import { useState, useEffect } from "react";
import {
  FiBook,
  FiPlus,
  FiSearch,
  FiClock,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your reading list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Reading List
            </h1>
            <p className="text-gray-600">Books you want to read</p>
          </div>
          <Button onClick={() => (window.location.href = "/browse")}>
            <FiPlus className="mr-2" />
            Add More Books
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {readingList.length}
            </div>
            <div className="text-sm text-gray-600">Total Books</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {readingList.filter((book) => book.progress > 0).length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {readingList.filter((book) => book.progress === 100).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your reading list..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Books List */}
        {filteredBooks.length > 0 ? (
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4 flex-1">
                    <div className="w-16 h-20 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBook className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        by {book.author}
                      </p>

                      {/* Reading Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{book.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateReadingProgress(
                              book.id,
                              Math.min(100, (book.progress || 0) + 25)
                            )
                          }
                        >
                          <FiClock className="h-4 w-4 mr-1" />
                          Update Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            (window.location.href = `/books/${book.id}`)
                          }
                        >
                          <FiEye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromList(book.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {readingList.length === 0
                ? "Your reading list is empty"
                : "No books found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {readingList.length === 0
                ? "Start building your reading list by browsing our collection!"
                : "Try adjusting your search terms."}
            </p>
            <Button onClick={() => (window.location.href = "/browse")}>
              Browse Books
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyBooksPage;
