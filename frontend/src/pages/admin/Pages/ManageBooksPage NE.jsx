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
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import BookFormModal from "./BookFormModal";
import { api } from "../../../config/api ne";

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
    try {
      const response = await api.getAdminBooks();
      if (response.success) {
        setBooks(response.data.books || []);
      } else {
        console.error('Failed to load books:', response.message);
        setBooks([]);
      }
    } catch (error) {
      console.error("Error loading books:", error);
      setBooks([]);
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
      console.log('💾 Saving book data:', bookData);

      let response;
      if (bookId) {
        response = await api.updateBook(bookId, bookData);
      } else {
        response = await api.createBook(bookData);
      }

      if (response.success) {
        await loadBooks();
        return response;
      } else {
        throw new Error(response.message || 'Failed to save book');
      }
    } catch (error) {
      console.error("Error saving book:", error);
      throw new Error(error.message || "Failed to save book. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.dewey_number && book.dewey_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" || book.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await api.deleteBook(id);
        if (response.success) {
          setBooks(books.filter((book) => book.id !== id));
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const book = books.find(b => b.id === id);
      const newStatus = book.status === "available" ? "unavailable" : "available";
      
      const response = await api.updateBook(id, { 
        status: newStatus,
        available_copies: newStatus === "available" ? book.total_copies : 0
      });
      
      if (response.success) {
        setBooks(
          books.map((book) =>
            book.id === id
              ? {
                  ...book,
                  status: newStatus,
                  available_copies: newStatus === "available" ? book.total_copies : 0,
                }
              : book
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating book status:", error);
      alert("Failed to update book status. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    return status === "available"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getCategoryBadge = (category) => {
    const styles = {
      "General Works": "bg-blue-100 text-blue-800",
      "Philosophy & Psychology": "bg-purple-100 text-purple-800",
      "Religion": "bg-red-100 text-red-800",
      "Social Sciences": "bg-green-100 text-green-800",
      "Language": "bg-yellow-100 text-yellow-800",
      "Natural Sciences & Math": "bg-indigo-100 text-indigo-800",
      "Technology & Applied Sciences": "bg-pink-100 text-pink-800",
      "Arts & Recreation": "bg-teal-100 text-teal-800",
      "Literature": "bg-orange-100 text-orange-800",
      "History & Geography": "bg-gray-100 text-gray-800",
      "Children's General Works": "bg-blue-100 text-blue-800",
      "Children's Philosophy & Psychology": "bg-purple-100 text-purple-800",
      "Children's Religion": "bg-red-100 text-red-800",
      "Children's Social Sciences": "bg-green-100 text-green-800",
      "Children's Language": "bg-yellow-100 text-yellow-800",
      "Children's Natural Sciences & Math": "bg-indigo-100 text-indigo-800",
      "Children's Technology": "bg-pink-100 text-pink-800",
      "Children's Arts & Recreation": "bg-teal-100 text-teal-800",
      "Children's Literature": "bg-orange-100 text-orange-800",
      "Children's History & Geography": "bg-gray-100 text-gray-800",
    };
    return styles[category] || "bg-gray-100 text-gray-800";
  };

  const getPriceBadge = (price) => {
    if (price === 0 || price === null) {
      return "bg-gray-100 text-gray-800";
    } else if (price < 10) {
      return "bg-green-100 text-green-800";
    } else if (price < 25) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-purple-100 text-purple-800";
    }
  };

  // Calculate total inventory value
  const totalInventoryValue = books.reduce((sum, book) => {
    const price = parseFloat(book.price) || 0;
    const copies = book.total_copies || 0;
    return sum + (price * copies);
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Books</h1>
          <p className="text-gray-600">
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
          <div className="text-2xl font-bold text-gray-900">{books.length}</div>
          <div className="text-sm text-gray-600">Total Books</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {books.filter((b) => b.status === "available").length}
          </div>
          <div className="text-sm text-gray-600">Available Books</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {books.reduce((sum, book) => sum + (book.total_copies || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Copies</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {books.reduce((sum, book) => sum + (book.available_copies || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Available Copies</div>
        </Card>
        <Card className="p-6 text-center">
          <FiDollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            ${totalInventoryValue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Inventory Value</div>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dewey Decimal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Copies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {books.length === 0 ? "No books found" : "No matching books"}
                      </h3>
                      <p className="text-gray-600">
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
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center">
                          {book.cover_image ? (
                            <img 
                              src={book.cover_image} 
                              alt={book.title}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <FiBook className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {book.publisher}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.isbn || 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {book.dewey_number || 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.published_date ? new Date(book.published_date).getFullYear() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span>{book.available_copies}/{book.total_copies}</span>
                        <span className="text-xs text-gray-500">
                          {((book.available_copies / book.total_copies) * 100).toFixed(0)}% available
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          book.status
                        )}`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(book.id)}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          book.status === "available"
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        title={book.status === "available" ? "Mark as unavailable" : "Mark as available"}
                      >
                        {book.status === "available" ? (
                          <FiXCircle className="mr-1" />
                        ) : (
                          <FiCheckCircle className="mr-1" />
                        )}
                        {book.status === "available" ? "Unavailable" : "Available"}
                      </button>
                      <button 
                        onClick={() => handleEditBook(book)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit book"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete book"
                      >
                        <FiTrash2 className="h-4 w-4" />
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