import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiBook, FiUser, FiCalendar } from "react-icons/fi";
import TextInput from "../../components/UI/TextInput";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

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
      
      // TODO: Replace with actual API call
      // const response = await articlesAPI.getAll();
      // setArticles(response.data);
      
      // For now, set empty array until backend is ready
      setArticles([]);
      
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
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation function
  const handleReadMore = (articleId) => {
    navigate(`/articles/${articleId}`);
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
            placeholder="🔍 Search articles..."
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
            No Articles Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? "No articles match your search." : "No articles available yet. Check back soon!"}
          </p>
          {searchQuery && (
            <Button variant="primary" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article._id}
              className="group hover:scale-105 transition-transform duration-300"
            >
              {/* Article Image */}
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              {/* Article Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                {article.title}
              </h3>

              {/* Article Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                <span className="flex items-center">
                  <FiUser className="mr-1" /> {article.author}
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-1" />{" "}
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Read More Button */}
              <Button
                onClick={() => handleReadMore(article._id)}
                variant="outline" 
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