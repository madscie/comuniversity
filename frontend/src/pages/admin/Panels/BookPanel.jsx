import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const BooksPanel = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/books');
      // const data = await response.json();
      // setBooks(data);
      
      // Temporary empty state until backend is ready
      setBooks([]);
    } catch (error) {
      console.error("Error loading books:", error);
      // Empty state on error
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/admin/books/${id}`, {
        //   method: 'DELETE'
        // });
        
        // Update local state temporarily
        setBooks(books.filter((book) => book.id !== id));
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Books</h1>
          <p className="text-gray-600">
            Add, edit, or remove books from the collection
          </p>
        </div>
        <Button variant="primary">
          <FiPlus className="mr-2 h-5 w-5" />
          Add New Book
        </Button>
      </header>

      {/* Search and Filters */}
      <Card className="p-6 border-0 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search books..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Categories</option>
            <option>Available</option>
            <option>Checked Out</option>
          </select>
          <Button variant="outline">Apply Filters</Button>
        </div>
      </Card>

      {/* Books Table */}
      <Card className="p-0 border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DDC
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
              {books.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No books found
                      </h3>
                      <p className="text-gray-600">
                        Get started by adding your first book to the collection.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {book.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{book.author}</td>
                    <td className="px-6 py-4 text-gray-600">{book.year}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">
                      {book.ddc}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          book.status === "Available"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BooksPanel;
