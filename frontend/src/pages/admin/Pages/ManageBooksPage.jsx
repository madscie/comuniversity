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
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import BookFormModal from "./BookFormModal"; // Import the modal component

const ManageBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Mock data for books
  const mockBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      category: "Fiction",
      publishedYear: 1925,
      status: "available",
      totalCopies: 5,
      availableCopies: 3,
      coverImage: null,
      description: "A classic novel of the Jazz Age",
      publisher: "Scribner",
      language: "English",
      pages: 180,
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      category: "Fiction",
      publishedYear: 1960,
      status: "available",
      totalCopies: 3,
      availableCopies: 1,
      coverImage: null,
      description: "A story of racial injustice and childhood innocence",
      publisher: "J.B. Lippincott & Co.",
      language: "English",
      pages: 281,
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      category: "Science Fiction",
      publishedYear: 1949,
      status: "unavailable",
      totalCopies: 4,
      availableCopies: 0,
      coverImage: null,
      description: "A dystopian social science fiction novel",
      publisher: "Secker & Warburg",
      language: "English",
      pages: 328,
    },
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0-14-143951-8",
      category: "Romance",
      publishedYear: 1813,
      status: "available",
      totalCopies: 6,
      availableCopies: 4,
      coverImage: null,
      description: "A romantic novel of manners",
      publisher: "T. Egerton",
      language: "English",
      pages: 432,
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setBooks(mockBooks);
      setLoading(false);
    }, 800);
  }, []);

  // Modal handlers
  const handleAddBook = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleSaveBook = async (bookData, bookId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (bookId) {
      // Update existing book
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === bookId ? { 
            ...book, 
            ...bookData,
            availableCopies: bookData.status === "available" ? book.availableCopies : 0
          } : book
        )
      );
    } else {
      // Add new book
      const newBook = {
        id: Math.max(...books.map(b => b.id), 0) + 1,
        ...bookData,
        availableCopies: bookData.totalCopies,
        coverImage: bookData.coverImage || null,
      };
      setBooks(prevBooks => [...prevBooks, newBook]);
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
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || book.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleDeleteBook = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      setBooks(books.filter((book) => book.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setBooks(
      books.map((book) =>
        book.id === id
          ? {
              ...book,
              status: book.status === "available" ? "unavailable" : "available",
              availableCopies: book.status === "available" ? 0 : book.totalCopies,
            }
          : book
      )
    );
  };

  const getStatusBadge = (status) => {
    return status === "available"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getCategoryBadge = (category) => {
    const styles = {
      Fiction: "bg-blue-100 text-blue-800",
      "Science Fiction": "bg-purple-100 text-purple-800",
      Romance: "bg-pink-100 text-pink-800",
      Mystery: "bg-orange-100 text-orange-800",
      Biography: "bg-teal-100 text-teal-800",
      History: "bg-yellow-100 text-yellow-800",
      Science: "bg-indigo-100 text-indigo-800",
      Technology: "bg-cyan-100 text-cyan-800",
      Art: "bg-rose-100 text-rose-800",
      Cooking: "bg-amber-100 text-amber-800",
      Travel: "bg-emerald-100 text-emerald-800",
      Children: "bg-lime-100 text-lime-800",
      "Young Adult": "bg-fuchsia-100 text-fuchsia-800",
      Fantasy: "bg-violet-100 text-violet-800",
      Horror: "bg-red-100 text-red-800",
      Poetry: "bg-sky-100 text-sky-800",
      Drama: "bg-rose-100 text-rose-800",
      Comics: "bg-orange-100 text-orange-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return styles[category] || "bg-gray-100 text-gray-800";
  };

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
            Manage library books and their availability
          </p>
        </div>
        <Button onClick={handleAddBook}>
          <FiPlus className="mr-2" />
          Add Book
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
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
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center">
                        <FiBook className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {book.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.isbn}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.publishedYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {book.availableCopies}/{book.totalCopies}
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
                    >
                      {book.status === "available" ? (
                        <FiXCircle className="mr-1" />
                      ) : (
                        <FiCheckCircle className="mr-1" />
                      )}
                      {book.status === "available" ? "Mark Unavailable" : "Mark Available"}
                    </button>
                    <button 
                      onClick={() => handleEditBook(book)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <Card className="text-center py-12">
          <div className="mx-auto bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center">
            <FiBook className="h-12 w-12 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No Books Found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter terms"
              : "No books added yet"}
          </p>
        </Card>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
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
            {books.reduce((sum, book) => sum + book.totalCopies, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Copies</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {books.reduce((sum, book) => sum + book.availableCopies, 0)}
          </div>
          <div className="text-sm text-gray-600">Available Copies</div>
        </Card>
      </div>

      {/* Book Form Modal */}
      <BookFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        book={selectedBook}
        onSave={handleSaveBook}
      />
    </div>
  );
};

export default ManageBooksPage;