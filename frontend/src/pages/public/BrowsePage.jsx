import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiBook,
  FiChevronRight,
  FiHome,
  FiArrowLeft,
  FiAlertCircle
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { api } from "../../config/apibac";

const BrowsePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryBooksCount, setCategoryBooksCount] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [error, setError] = useState(null);

  // Main Dewey Decimal Categories
  const deweyCategories = [
    {
      number: "000-099",
      name: "General Works",
      description: "Computer science, information, general reference works",
      color: "from-blue-500 to-blue-600",
      icon: "📚",
    },
    {
      number: "100-199",
      name: "Philosophy & Psychology",
      description: "Ethics, logic, metaphysics, psychology",
      color: "from-purple-500 to-purple-600",
      icon: "🧠",
    },
    {
      number: "200-299",
      name: "Religion",
      description: "Christianity, other religions, mythology",
      color: "from-red-500 to-red-600",
      icon: "⛪",
    },
    {
      number: "300-399",
      name: "Social Sciences",
      description: "Sociology, economics, law, politics, education",
      color: "from-green-500 to-green-600",
      icon: "🌍",
    },
    {
      number: "400-499",
      name: "Language",
      description: "Grammar, linguistics, dictionaries, specific languages",
      color: "from-yellow-500 to-yellow-600",
      icon: "🗣️",
    },
    {
      number: "500-599",
      name: "Natural Sciences & Math",
      description: "Biology, physics, chemistry, astronomy, mathematics",
      color: "from-indigo-500 to-indigo-600",
      icon: "🔬",
    },
    {
      number: "600-699",
      name: "Technology & Applied Sciences",
      description: "Medicine, engineering, agriculture, home economics",
      color: "from-pink-500 to-pink-600",
      icon: "⚙️",
    },
    {
      number: "700-799",
      name: "Arts & Recreation",
      description: "Music, fine arts, photography, sports",
      color: "from-teal-500 to-teal-600",
      icon: "🎨",
    },
    {
      number: "800-899",
      name: "Literature",
      description: "Poetry, plays, novels, essays from around the world",
      color: "from-orange-500 to-orange-600",
      icon: "📖",
    },
    {
      number: "900-999",
      name: "History & Geography",
      description: "World history, geography, travel, biography",
      color: "from-gray-500 to-gray-600",
      icon: "🏛️",
    },
  ];

  // Children's Categories
  const childrensCategories = [
    {
      number: "J 000-099",
      name: "Children's General Works",
      description: "Encyclopedias, reference books for kids",
      color: "from-blue-400 to-blue-500",
      icon: "📘",
    },
    {
      number: "J 100-199",
      name: "Children's Philosophy & Psychology",
      description: "Feelings, thinking, values for young readers",
      color: "from-purple-400 to-purple-500",
      icon: "💭",
    },
    {
      number: "J 200-299",
      name: "Children's Religion",
      description: "Bible stories, world religions, mythology",
      color: "from-red-400 to-red-500",
      icon: "🙏",
    },
    {
      number: "J 300-399",
      name: "Children's Social Sciences",
      description: "Friends, community, cultures, careers",
      color: "from-green-400 to-green-500",
      icon: "🤝",
    },
    {
      number: "J 400-499",
      name: "Children's Language",
      description: "Grammar, ABCs, beginner dictionaries",
      color: "from-yellow-400 to-yellow-500",
      icon: "🔤",
    },
    {
      number: "J 500-599",
      name: "Children's Natural Sciences & Math",
      description: "Animals, space, plants, numbers",
      color: "from-indigo-400 to-indigo-500",
      icon: "🌱",
    },
    {
      number: "J 600-699",
      name: "Children's Technology",
      description: "Inventions, health, how things work",
      color: "from-pink-400 to-pink-500",
      icon: "🛠️",
    },
    {
      number: "J 700-799",
      name: "Children's Arts & Recreation",
      description: "Drawing, music, sports, crafts",
      color: "from-teal-400 to-teal-500",
      icon: "🎨",
    },
    {
      number: "J 800-899",
      name: "Children's Literature",
      description: "Stories, poems, fairy tales",
      color: "from-orange-400 to-orange-500",
      icon: "📖",
    },
    {
      number: "J 900-999",
      name: "Children's History & Geography",
      description: "History, maps, cultures of the world",
      color: "from-gray-400 to-gray-500",
      icon: "🌍",
    },
  ];

  // Load categories and books from API
  useEffect(() => {
    loadCategoriesAndBooks();
  }, []);

  // Set selected category based on URL parameter
  useEffect(() => {
    if (urlCategory) {
      const category =
        deweyCategories.find((cat) => cat.number === urlCategory) ||
        childrensCategories.find((cat) => cat.number === urlCategory);
      if (category) {
        setSelectedCategory(category);
        loadBooksByCategory(category.name);
      }
    }
  }, [urlCategory]);

  const loadCategoriesAndBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📚 Loading categories and books from API...");
      
      // Get books from API
      const booksResponse = await api.getBooks();
      console.log("📖 Books API response:", booksResponse);
      
      if (booksResponse.success) {
        setBooks(booksResponse.data.books || []);
        
        // Get categories from API
        const categoriesResponse = await api.getCategories();
        console.log("📊 Categories API response:", categoriesResponse);
        
        if (categoriesResponse.success) {
          setCategoryBooksCount(categoriesResponse.data || []);
        } else {
          // Fallback: calculate from books
          const categoryCounts = {};
          booksResponse.data.books.forEach(book => {
            if (book.category) {
              categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
            }
          });
          
          const categoriesArray = Object.keys(categoryCounts).map(category => ({
            category: category,
            book_count: categoryCounts[category]
          }));
          
          setCategoryBooksCount(categoriesArray);
        }
      } else {
        setError("Failed to load books from server");
        setBooks([]);
        setCategoryBooksCount([]);
      }
    } catch (error) {
      console.error('❌ Error loading books:', error);
      setError("Failed to connect to server. Please try again.");
      setBooks([]);
      setCategoryBooksCount([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBooksByCategory = async (categoryName) => {
    setLoadingCategory(true);
    try {
      const booksResponse = await api.getBooks({ category: categoryName });
      if (booksResponse.success) {
        setBooks(booksResponse.data.books || []);
        console.log(`✅ Loaded ${booksResponse.data.books.length} books from ${categoryName}`);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('❌ Error loading category books:', error);
      setBooks([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setSearchParams({ category: category.number });
    await loadBooksByCategory(category.name);
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
    setSearchParams({});
    loadCategoriesAndBooks(); // Reload all books
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleViewAllBooks = () => {
    if (selectedCategory) {
      navigate(`/search?category=${encodeURIComponent(selectedCategory.name)}`);
    } else {
      navigate('/search');
    }
  };

  const handleAdvancedSearch = () => {
    navigate("/search");
  };

  // Get book count for a category
  const getBookCount = (categoryName) => {
    const category = categoryBooksCount.find(
      cat => cat.category === categoryName
    );
    return category ? category.book_count : 0;
  };

  // Calculate total books
  const totalBooks = books.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading library categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Books</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadCategoriesAndBooks}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiHome className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse Our Collection
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Explore{" "}
            <span className="font-semibold text-blue-600">{totalBooks}+ books</span>{" "}
            organized by the Dewey Decimal Classification System
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="🔍 Quick search across all categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-12 py-4 text-lg border-0 rounded-2xl shadow-lg backdrop-blur-sm bg-white/95 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-4 text-blue-600 hover:text-blue-700"
              >
                <FiSearch className="h-6 w-6" />
              </button>
            </div>
          </form>
        </div>

        {/* Back Button when category is selected */}
        {selectedCategory && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleClearSelection}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to All Categories
            </Button>
          </div>
        )}

        {/* Loading State for Category */}
        {loadingCategory && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading books...</p>
          </div>
        )}

        {/* Dewey Categories Grid - Hidden when a category is selected */}
        {!selectedCategory && !loadingCategory && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {deweyCategories.map((category) => {
                const bookCount = getBookCount(category.name);
                return (
                  <Card
                    key={category.number}
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-xl"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                    >
                      {category.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {category.number}
                    </h3>

                    <h4 className="text-lg font-semibold text-gray-800 text-center mb-3">
                      {category.name}
                    </h4>

                    <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {bookCount} {bookCount === 1 ? 'book' : 'books'}
                      </span>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium">Explore</span>
                        <FiChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Children's Section */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8 mt-12">
              Children's Section
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {childrensCategories.map((category) => {
                const bookCount = getBookCount(category.name);
                return (
                  <Card
                    key={category.number}
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-xl"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                    >
                      {category.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {category.number}
                    </h3>

                    <h4 className="text-lg font-semibold text-gray-800 text-center mb-3">
                      {category.name}
                    </h4>

                    <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {bookCount} {bookCount === 1 ? 'book' : 'books'}
                      </span>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium">Explore</span>
                        <FiChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Books Preview Section */}
            {books.length > 0 && (
              <Card className="mb-12 border-0 shadow-xl">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Recently Added Books
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.slice(0, 6).map((book) => (
                      <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          {book.cover_image ? (
                            <img
                              src={book.cover_image}
                              alt={book.title}
                              className="w-16 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                              <FiBook className="h-6 w-6" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              by {book.author}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {book.category}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/books/${book.id}`)}
                              className="mt-2 text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Selected Category Details */}
        {selectedCategory && !loadingCategory && (
          <Card className="mb-12 border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl">
            <div className="text-center p-8">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${selectedCategory.color} flex items-center justify-center text-white text-3xl mb-6 mx-auto`}
              >
                {selectedCategory.icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory.number} - {selectedCategory.name}
              </h2>
              <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
                {selectedCategory.description}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  variant="primary"
                  className="px-6 py-3"
                  onClick={handleViewAllBooks}
                >
                  <FiBook className="mr-2 h-5 w-5" />
                  View All {books.length} Books
                </Button>
                <Button
                  variant="secondary"
                  className="px-6 py-3"
                  onClick={handleAdvancedSearch}
                >
                  <FiSearch className="mr-2 h-5 w-5" />
                  Advanced Search in {selectedCategory.number}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Books List for Selected Category */}
        {selectedCategory && !loadingCategory && books.length > 0 && (
          <Card className="mb-12 border-0 shadow-xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Books in {selectedCategory.name}
              </h2>
              <div className="space-y-4">
                {books.map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          <FiBook className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                        <p className="text-xs text-gray-500">{book.publishedYear || 'Year not available'}</p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      View Book
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {books.length === 0 && !loadingCategory && (
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm py-16">
            <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              No Books Available
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              {selectedCategory 
                ? `No books found in the ${selectedCategory.name} category.`
                : 'No books are currently available in the library.'
              }
            </p>
            <Button variant="primary" onClick={loadCategoriesAndBooks}>
              Refresh Library
            </Button>
          </Card>
        )}

        {/* Statistics */}
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Collection Overview
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalBooks}
              </div>
              <div className="text-gray-600">Total Books</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {deweyCategories.length + childrensCategories.length}
              </div>
              <div className="text-gray-600">Main Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {categoryBooksCount.length}
              </div>
              <div className="text-gray-600">Active Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Digital Access</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BrowsePage;