// src/pages/public/ArticlesPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBook, FiUser, FiCalendar } from "react-icons/fi";
import TextInput from "../../components/UI/TextInput";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const ArticlesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Mock data (replace with backend later)
  const mockArticles = [
    {
      _id: "1",
      title: "The Future of Digital Libraries",
      description:
        "Explore how digital libraries are transforming knowledge access worldwide through open resources and AI-driven discovery.",
      author: "Eunice L.",
      createdAt: "2025-09-01T12:00:00Z",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800",
    },
    {
      _id: "2",
      title: "Mastering the Dewey Decimal System",
      description:
        "A beginner-friendly guide to understanding and applying the Dewey Decimal System for organizing books.",
      author: "James M.",
      createdAt: "2025-08-15T10:30:00Z",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
    },
    {
      _id: "3",
      title: "The Rise of E-Books in Education",
      description:
        "Why e-books are becoming the primary tool for modern education and how institutions are adapting to this shift.",
      author: "Linda K.",
      createdAt: "2025-07-20T08:15:00Z",
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    },
  ];

  // Filter articles locally
  const filteredArticles = mockArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation function
  const handleReadMore = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Page Header */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          <span className="inline-flex items-center">
            <FiBook className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            Articles
          </span>
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
          Dive into curated articles from our digital library community.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-6 sm:mb-8 lg:mb-10">
        <form onSubmit={(e) => e.preventDefault()} className="relative group">
          <TextInput
            type="text"
            placeholder="🔍 Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 sm:pl-6 pr-10 sm:pr-12 py-2 sm:py-3 lg:py-4 text-sm sm:text-base border shadow-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl"
          />
          <FiSearch className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
        </form>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">No articles found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article._id}
              className="group hover:scale-105 transition-transform duration-300 dark:shadow-gray-900/50"
            >
              {/* Article Image */}
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                />
              )}

              {/* Article Title */}
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 line-clamp-2">
                {article.title}
              </h3>

              {/* Article Description */}
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4 line-clamp-3">
                {article.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4">
                <span className="flex items-center">
                  <FiUser className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {article.author}
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Read More Button */}
              <Button
                onClick={() => handleReadMore(article._id)}
                variant="outline"
                className="w-full text-xs sm:text-sm"
              >
                Read More
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;