import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiBook, FiUser, FiCalendar, FiEye, FiClock, FiTag } from "react-icons/fi";
import TextInput from "../../components/UI/TextInput";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import axios from "axios";

const ArticlesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ACTUAL API CALL - FIXED
      const response = await axios.get('http://localhost:5000/api/articles');
      console.log("Articles API response:", response.data);
      
      if (response.data.success) {
        setArticles(response.data.data.articles);
      } else {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }
      
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on search query
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.tags && article.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))
  );

  // Navigation function
  const handleReadMore = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="inline-flex items-center">
              <FiBook className="mr-3 text-blue-600" />
              Articles
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dive into curated articles from our digital library community.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <span className="inline-flex items-center">
            <FiBook className="mr-3 text-blue-600" />
            Articles
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Dive into curated articles from our digital library community.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-2xl font-bold text-blue-600">{articles.length}</div>
          <div className="text-gray-600 text-sm">Total Articles</div>
        </Card>
        <Card className="text-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-2xl font-bold text-green-600">
            {articles.filter(a => a.featured).length}
          </div>
          <div className="text-gray-600 text-sm">Featured</div>
        </Card>
        <Card className="text-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-2xl font-bold text-purple-600">
            {[...new Set(articles.map(a => a.category))].length}
          </div>
          <div className="text-gray-600 text-sm">Categories</div>
        </Card>
        <Card className="text-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="text-2xl font-bold text-orange-600">
            {articles.reduce((total, article) => total + (article.views || 0), 0)}
          </div>
          <div className="text-gray-600 text-sm">Total Views</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-700">{error}</p>
          <Button 
            variant="primary" 
            onClick={fetchArticles}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10">
        <form onSubmit={(e) => e.preventDefault()} className="relative group">
          <TextInput
            type="text"
            placeholder="🔍 Search articles by title, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 pr-14 py-4 text-base border shadow-sm bg-white rounded-xl"
          />
          <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
        </form>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center">
            <FiBook className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? "No Articles Found" : "No Articles Available"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? "No articles match your search. Try different keywords." : "No articles available yet. Check back soon!"}
          </p>
          {searchQuery && (
            <Button variant="primary" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="group hover:scale-105 transition-transform duration-300 bg-white/90 backdrop-blur-sm"
            >
              {/* Article Image */}
              {article.image_url ? (
                <img
                  src={`http://localhost:5000${article.image_url}`}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                  <FiBook className="h-16 w-16 text-blue-600" />
                </div>
              )}

              {/* Featured Badge */}
              {article.featured && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  FEATURED
                </div>
              )}

              {/* Article Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                {article.title}
              </h3>

              {/* Article Excerpt */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <FiUser className="mr-1" /> {article.author}
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-1" /> {formatDate(article.published_date)}
                </span>
                <span className="flex items-center">
                  <FiClock className="mr-1" /> {article.read_time} min read
                </span>
                <span className="flex items-center">
                  <FiEye className="mr-1" /> {article.views} views
                </span>
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {article.category}
                </span>
                {article.tags && article.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                    <FiTag className="inline mr-1" size={10} />
                    {tag}
                  </span>
                ))}
                {article.tags && article.tags.length > 2 && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                    +{article.tags.length - 2} more
                  </span>
                )}
              </div>

              {/* Price if applicable */}
              {article.amount > 0 && (
                <div className="mb-4">
                  <span className="text-green-600 font-bold">${article.amount}</span>
                </div>
              )}

              {/* Read More Button */}
              <Button
                onClick={() => handleReadMore(article.id)}
                variant="gradient" 
                className="w-full"
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