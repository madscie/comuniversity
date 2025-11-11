import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
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

        // DEBUG: Check image URLs - 
      console.log("=== IMAGE DEBUG ===");
      response.data.data.articles.forEach(article => {
        console.log(`Article: ${article.title}`);
        console.log(`Image URL: ${article.image_url}`);
        console.log(`Has image: ${!!article.image_url}`);
      });
      console.log("=== END DEBUG ===");
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
      // <div className="container mx-auto px-4 py-12">
       <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            <span className="inline-flex items-center">
              <FiBook className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />              Articles
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">            
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

            {/* Temporary Debug - Remove after fixing */}
      <div className="fixed top-4 right-4 bg-yellow-100 p-2 rounded text-xs z-50 border border-yellow-300">
        <div><strong>Debug Info:</strong></div>
        <div>Total articles: {articles.length}</div>
        <div>Articles with images: {articles.filter(a => a.image_url).length}</div>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-6 sm:mb-8 lg:mb-10">
        <form onSubmit={(e) => e.preventDefault()} className="relative group">
          <TextInput
            type="text"
            placeholder="🔍 Search articles by title, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 sm:pl-6 pr-10 sm:pr-12 py-2 sm:py-3 lg:py-4 text-sm sm:text-base border shadow-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl"          />
          *<FiSearch className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />        </form>
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
          <p className="text-gray-600 mb-6 dark:text-gray-400 text-sm sm:text-base">
            {searchQuery ? "No articles match your search. Try different keywords." : "No articles available yet. Check back soon!"}
          </p>
          {searchQuery && (
            <Button variant="primary" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="group hover:scale-105 transition-transform duration-300 dark:shadow-gray-900/50"
            >
              {/* Article Image */}
                            {/* Article Image - FIXED VERSION */}
              <div className="w-full h-32 sm:h-40 lg:h-48 rounded-lg mb-3 sm:mb-4 overflow-hidden bg-gray-100">
                {article.image_url && article.image_url !== '' && article.image_url !== 'null' ? (
                  <img
                    src={
                      article.image_url.startsWith('http') 
                        ? article.image_url 
                        : `http://localhost:5000${article.image_url}`
                    }
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.error(`Failed to load image: ${article.image_url}`);
                      // Hide broken image and show fallback
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                
                {/* Fallback that shows when no image or image fails */}
                {(!article.image_url || article.image_url === '' || article.image_url === 'null') && (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <FiBook className="h-16 w-16 text-blue-600" />
                  </div>
                )}
              </div>
              {/* {article.image_url ? (//REPLACED FOR NOT SHOWING IMAGES
                <img
                  src={`http://localhost:5000${article.image_url}`}
                  alt={article.title}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                   />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                  <FiBook className="h-16 w-16 text-blue-600" />
                </div>
              )} */}

              {/* Featured Badge */}
              {article.featured && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  FEATURED
                </div>
              )}

              {/* Article Title */}
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 line-clamp-2">
                {article.title}
              </h3>

              {/* Article Excerpt */}
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              {/* Metadata */}
              <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4">
                <span className="flex items-center">
                  <FiUser className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {article.author}
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {formatDate(article.published_date)}
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
               variant="outline"
              className="w-full text-xs sm:text-sm"       >
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