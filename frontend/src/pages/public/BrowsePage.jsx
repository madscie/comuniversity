import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiBook,
  FiChevronRight,
  FiHome,
  FiArrowLeft,
  FiLoader,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { bookAPI } from "../../services/api";

const BrowsePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);

  // Main Dewey Decimal Categories
  const deweyCategories = [
    {
      number: "000-099",
      name: "General Works",
      description: "Computer science, information, general reference works",
      color: "from-blue-500 to-blue-600",
      icon: "📚",
      apiName: "general-works",
      deweyCode: "000"
    },
    {
      number: "100-199",
      name: "Philosophy & Psychology",
      description: "Ethics, logic, metaphysics, psychology",
      color: "from-purple-500 to-purple-600",
      icon: "🧠",
      apiName: "philosophy-psychology",
      deweyCode: "100"
    },
    {
      number: "200-299",
      name: "Religion",
      description: "Christianity, other religions, mythology",
      color: "from-red-500 to-red-600",
      icon: "⛪",
      apiName: "religion",
      deweyCode: "200"
    },
    {
      number: "300-399",
      name: "Social Sciences",
      description: "Sociology, economics, law, politics, education",
      color: "from-green-500 to-green-600",
      icon: "🌍",
      apiName: "social-sciences",
      deweyCode: "300"
    },
    {
      number: "400-499",
      name: "Language",
      description: "Grammar, linguistics, dictionaries, specific languages",
      color: "from-yellow-500 to-yellow-600",
      icon: "🗣️",
      apiName: "language",
      deweyCode: "400"
    },
    {
      number: "500-599",
      name: "Natural Sciences & Math",
      description: "Biology, physics, chemistry, astronomy, mathematics",
      color: "from-indigo-500 to-indigo-600",
      icon: "🔬",
      apiName: "natural-sciences-math",
      deweyCode: "500"
    },
    {
      number: "600-699",
      name: "Technology & Applied Sciences",
      description: "Medicine, engineering, agriculture, home economics",
      color: "from-pink-500 to-pink-600",
      icon: "⚙️",
      apiName: "technology-applied-sciences",
      deweyCode: "600"
    },
    {
      number: "700-799",
      name: "Arts & Recreation",
      description: "Music, fine arts, photography, sports",
      color: "from-teal-500 to-teal-600",
      icon: "🎨",
      apiName: "arts-recreation",
      deweyCode: "700"
    },
    {
      number: "800-899",
      name: "Literature",
      description: "Poetry, plays, novels, essays from around the world",
      color: "from-orange-500 to-orange-600",
      icon: "📖",
      apiName: "literature",
      deweyCode: "800"
    },
    {
      number: "900-999",
      name: "History & Geography",
      description: "World history, geography, travel, biography",
      color: "from-gray-500 to-gray-600",
      icon: "🏛️",
      apiName: "history-geography",
      deweyCode: "900"
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
      apiName: "children",
      isChildren: true
    },
    {
      number: "J FIC",
      name: "Children's Fiction",
      description: "Storybooks, picture books, early readers",
      color: "from-purple-400 to-purple-500",
      icon: "📚",
      apiName: "children",
      isChildren: true
    },
    {
      number: "J SCI",
      name: "Children's Science",
      description: "Science, animals, nature for young readers",
      color: "from-green-400 to-green-500",
      icon: "🔬",
      apiName: "children",
      isChildren: true
    },
    {
      number: "J ART",
      name: "Children's Arts",
      description: "Drawing, crafts, music for children",
      color: "from-pink-400 to-pink-500",
      icon: "🎨",
      apiName: "children",
      isChildren: true
    }
  ];

  // Fetch all books on component mount
  useEffect(() => {
    fetchAllBooks();
  }, []);

  // Set selected category based on URL parameter
  useEffect(() => {
    if (urlCategory) {
      const category =
        deweyCategories.find((cat) => cat.apiName === urlCategory) ||
        childrensCategories.find((cat) => cat.apiName === urlCategory);
      if (category) {
        handleCategorySelect(category);
      }
    }
  }, [urlCategory, allBooks]);

  const fetchAllBooks = async () => {
    setLoading(true);
    try {
      console.log("📚 Fetching all books for browse page...");
      const books = await bookAPI.getAll();
      console.log("✅ Books fetched for browse:", books);
      setAllBooks(books);
    } catch (error) {
      console.error("❌ Error fetching books:", error);
      setAllBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    console.log("🎯 Selected category:", category);
    setSelectedCategory(category);
    setSearchParams({ category: category.apiName });
    
    // Filter books for this category
    setBooksLoading(true);
    try {
      let filteredBooks = [];
      
      if (category.isChildren) {
        // Filter for children's books
        filteredBooks = allBooks.filter(book => 
          book.content_type === 'children' || 
          book.age_group || 
          book.reading_level ||
          (book.category && book.category.toLowerCase().includes('children'))
        );
        console.log("🧒 Children's books filtered:", filteredBooks);
      } else if (category.deweyCode) {
        // Filter by Dewey Decimal code
        filteredBooks = allBooks.filter(book => 
          book.dewey_decimal && 
          book.dewey_decimal.startsWith(category.deweyCode.charAt(0))
        );
        console.log("🔢 Dewey books filtered:", filteredBooks);
      } else {
        // Filter by category name
        filteredBooks = allBooks.filter(book => 
          book.category && 
          book.category.toLowerCase().includes(category.apiName.replace('-', ' '))
        );
      }
      
      setCategoryBooks(filteredBooks);
    } catch (error) {
      console.error("❌ Error filtering category books:", error);
      setCategoryBooks([]);
    } finally {
      setBooksLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
    setCategoryBooks([]);
    setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleViewAllBooks = () => {
    if (selectedCategory) {
      navigate(`/search?category=${selectedCategory.apiName}`);
    } else {
      navigate('/search');
    }
  };

  const handleAdvancedSearch = () => {
    navigate("/search");
  };

  const handleBookClick = (book) => {
    navigate(`/book/${book.id}`);
  };

  // Helper function to get book count for a category
  const getBookCountForCategory = (category) => {
    if (!allBooks.length) return 0;
    
    if (category.isChildren) {
      return allBooks.filter(book => 
        book.content_type === 'children' || 
        book.age_group || 
        book.reading_level ||
        (book.category && book.category.toLowerCase().includes('children'))
      ).length;
    } else if (category.deweyCode) {
      return allBooks.filter(book => 
        book.dewey_decimal && 
        book.dewey_decimal.startsWith(category.deweyCode.charAt(0))
      ).length;
    } else {
      return allBooks.filter(book => 
        book.category && 
        book.category.toLowerCase().includes(category.apiName.replace('-', ' '))
      ).length;
    }
  };

  // Calculate total books
  const totalBooks = allBooks.length;

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3002${imagePath}`;
  };

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
            <span className="font-semibold text-blue-600">
              {loading ? "..." : `${totalBooks}+ books`}
            </span>{" "}
            organized by categories and subjects
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

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> {allBooks.length} books loaded | 
              Selected: {selectedCategory?.name || 'None'} | 
              Category Books: {categoryBooks.length}
            </p>
          </div>
        )}

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

        {/* Dewey Categories Grid - Hidden when a category is selected */}
        {!selectedCategory && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Main Library Collection
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {deweyCategories.map((category) => (
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
                      {loading ? (
                        <FiLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        `${getBookCountForCategory(category)} books`
                      )}
                    </span>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                      <span className="text-sm font-medium">Explore</span>
                      <FiChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Children's Section */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Children's Section
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {childrensCategories.map((category) => (
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
                      {loading ? (
                        <FiLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        `${getBookCountForCategory(category)} books`
                      )}
                    </span>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                      <span className="text-sm font-medium">Explore</span>
                      <FiChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Selected Category Details with Books */}
        {selectedCategory && (
          <div className="space-y-8">
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl">
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
                    View All {categoryBooks.length} Books
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-6 py-3"
                    onClick={handleAdvancedSearch}
                  >
                    <FiSearch className="mr-2 h-5 w-5" />
                    Advanced Search
                  </Button>
                </div>
              </div>
            </Card>

            {/* Books in this Category */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Books in this Category ({categoryBooks.length})
              </h3>
              
              {booksLoading ? (
                <div className="flex justify-center items-center py-12">
                  <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading books...</span>
                </div>
              ) : categoryBooks.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryBooks.map((book) => (
                    <Card
                      key={book.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                      onClick={() => handleBookClick(book)}
                    >
                      <div className="flex space-x-4">
                        {book.cover_image ? (
                          <img
                            src={getImageUrl(book.cover_image)}
                            alt={book.title}
                            className="w-20 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {!book.cover_image && (
                          <div className="w-20 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FiBook className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {book.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            by {book.author}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {book.description || "No description available"}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              {book.category || "General"}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              book.available_copies > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {book.available_copies || 0} available
                            </span>
                          </div>
                          {book.age_group && (
                            <div className="mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Age: {book.age_group}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12 border-0 bg-yellow-50">
                  <FiBook className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    No books found in this category
                  </h4>
                  <p className="text-gray-600 mb-4">
                    There are currently no books available in the {selectedCategory.name} category.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleClearSelection}
                  >
                    Browse Other Categories
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-md mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Collection Overview
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? "..." : totalBooks}
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
                {loading ? "..." : allBooks.filter(book => book.available_copies > 0).length}
              </div>
              <div className="text-gray-600">Available Now</div>
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