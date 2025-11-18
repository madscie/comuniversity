import { useState, useEffect } from "react";
import {
  FiBook,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import BookFormModal from "./BookFormModal";
import { bookService } from "../../../services/bookService";
import { getImageUrl } from "../../../utils/helpers";

const ManageBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    let toastShown = false;

    try {
      // Get ALL books for admin management
      const response = await bookService.getBooks({ includeAll: true });
      console.log("📚 Admin Books API Response:", response);

      if (response.success) {
        const booksData = response.data?.books || response.data || [];
        console.log("📖 Processed admin books data:", booksData);

        // Calculate stats for display
        const totalBooks = booksData.length;
        const availableBooks = booksData.filter(
          (book) => book.status === "available"
        ).length;

        setBooks(booksData);

        // REMOVED: The toast notification that was showing book count
        // This was causing the annoying popup for large collections

        console.log(
          `📊 Admin Books Summary: ${totalBooks} total, ${availableBooks} available`
        );
      } else {
        console.error("Failed to load books:", response.message);
        setBooks([]);
        // Only show error toast if no toast has been shown yet
        if (!toastShown) {
          toastShown = true;
          toast.error(
            "❌ Failed to load books: " + (response.message || "Unknown error")
          );
        }
      }
    } catch (error) {
      console.error("Error loading books:", error);
      setBooks([]);
      // Only show error toast if no toast has been shown yet
      if (!toastShown) {
        toastShown = true;
        toast.error("❌ Error loading books: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleSaveBook = async (bookData, bookId) => {
    setSaveLoading(true);
    try {
      console.log("💾 Saving book data:", bookData);
      console.log("📝 Book ID (if editing):", bookId);

      let response;
      if (bookId) {
        console.log("🔄 Updating existing book...");
        response = await bookService.updateBook(bookId, bookData);
      } else {
        console.log("🆕 Creating new book...");
        response = await bookService.createBook(bookData);
      }

      console.log("📥 Save response:", response);

      if (response.success) {
        await loadBooks();
        toast.success(
          bookId ? "Book updated successfully!" : "Book added successfully!"
        );
        return response;
      } else {
        throw new Error(response.message || "Failed to save book");
      }
    } catch (error) {
      console.error("❌ Error saving book:", error);
      console.error("📊 Error details:", {
        type: error.type,
        status: error.status,
        message: error.message,
        data: error.data,
      });

      let errorMessage = "Failed to save book. Please try again.";
      if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("ISBN already exists")) {
        errorMessage = "A book with this ISBN already exists.";
      } else if (error.data?.error) {
        // Show specific backend error if available
        errorMessage = error.data.error;
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await bookService.deleteBook(id);
        if (response.success) {
          setBooks(books.filter((book) => book.id !== id));
          toast.success("Book deleted successfully!");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("Failed to delete book. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const book = books.find((b) => b.id === id);
      const newStatus =
        book.status === "available" ? "unavailable" : "available";

      const response = await bookService.updateBookStatus(id, newStatus);

      if (response.success) {
        setBooks(
          books.map((book) =>
            book.id === id
              ? {
                  ...book,
                  status: newStatus,
                  available_copies:
                    newStatus === "available" ? book.total_copies : 0,
                }
              : book
          )
        );
        toast.success(`Book marked as ${newStatus}!`);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating book status:", error);
      toast.error("Failed to update book status. Please try again.");
    }
  };

  // Helper function to render book image
  const renderBookImage = (book) => {
    const imageUrl = getImageUrl(book.cover_image);

    return (
      <div className="relative flex-shrink-0 h-10 w-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={book.title}
              className="h-10 w-10 object-cover"
              onError={(e) => {
                console.error(
                  `❌ Failed to load image for book ${book.id}:`,
                  imageUrl
                );
                e.target.style.display = "none";
                const fallback = e.target.nextSibling;
                if (fallback) {
                  fallback.classList.remove("hidden");
                }
              }}
              onLoad={(e) => {
                console.log(
                  `✅ Image loaded successfully for book ${book.id}:`,
                  imageUrl
                );
                const fallback = e.target.nextSibling;
                if (fallback) {
                  fallback.classList.add("hidden");
                }
              }}
            />
            <div className="image-fallback absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
              <FiBook className="h-5 w-5 text-orange-600" />
            </div>
          </>
        ) : (
          <FiBook className="h-5 w-5 text-orange-600" />
        )}
      </div>
    );
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn &&
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.dewey_number &&
        book.dewey_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" || book.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    return status === "available"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getCategoryBadge = (category) => {
    const styles = {
      "General Works":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Philosophy & Psychology":
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Religion: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Social Sciences":
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Language:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Natural Sciences & Math":
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      "Technology & Applied Sciences":
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "Arts & Recreation":
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      Literature:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "History & Geography":
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return (
      styles[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  const getPriceBadge = (price) => {
    const priceValue = parseFloat(price || 0);
    if (priceValue === 0)
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    if (priceValue < 10)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (priceValue < 25)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  };

  const totalInventoryValue = books.reduce((sum, book) => {
    const price = parseFloat(book.price) || 0;
    const copies = book.total_copies || 0;
    return sum + price * copies;
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Books
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage library books, pricing, and availability
          </p>
        </div>
        <Button onClick={handleAddBook}>
          <FiPlus className="mr-2" />
          Add Book
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="p-6 text-center">
          <FiBook className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {books.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Books
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {books.filter((b) => b.status === "available").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Available Books
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {books.reduce((sum, book) => sum + (book.total_copies || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Copies
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {books.reduce((sum, book) => sum + (book.available_copies || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Available Copies
          </div>
        </Card>
        <Card className="p-6 text-center">
          <FiDollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${totalInventoryValue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Inventory Value
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, ISBN, or Dewey Decimal..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Books Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dewey Decimal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Copies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <FiBook className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {books.length === 0
                          ? "No books found"
                          : "No matching books"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {books.length === 0
                          ? "Get started by adding your first book."
                          : "Try changing your search or filter criteria."}
                      </p>
                      {books.length === 0 && (
                        <Button onClick={handleAddBook} className="mt-4">
                          <FiPlus className="mr-2" />
                          Add Your First Book
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {renderBookImage(book)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {book.publisher || "No publisher"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {book.isbn || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadge(
                          book.category
                        )}`}
                      >
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {book.dewey_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriceBadge(
                          book.price
                        )}`}
                      >
                        ${parseFloat(book.price || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {book.published_date
                        ? new Date(book.published_date).getFullYear()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>
                          {book.available_copies || 0}/{book.total_copies || 0}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {book.total_copies > 0
                            ? `${Math.round(
                                ((book.available_copies || 0) /
                                  book.total_copies) *
                                  100
                              )}% available`
                            : "0% available"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          book.status
                        )}`}
                      >
                        {book.status || "available"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(book.id)}
                        className={`inline-flex items-center cursor-pointer px-2 py-1 rounded text-xs ${
                          book.status === "available"
                            ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        }`}
                        title={
                          book.status === "available"
                            ? "Mark as unavailable"
                            : "Mark as available"
                        }
                      >
                        {book.status === "available" ? (
                          <FiXCircle className="mr-1" />
                        ) : (
                          <FiCheckCircle className="mr-1" />
                        )}
                        {book.status === "available"
                          ? "Unavailable"
                          : "Available"}
                      </button>
                      <button
                        onClick={() => handleEditBook(book)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="Edit book"
                      >
                        <FiEdit className="h-4 w-4 cursor-pointer" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Delete book"
                      >
                        <FiTrash2 className="h-4 w-4 cursor-pointer" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Book Form Modal */}
      <BookFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        book={selectedBook}
        onSave={handleSaveBook}
        isLoading={saveLoading}
      />
    </div>
  );
};

export default ManageBooksPage;
