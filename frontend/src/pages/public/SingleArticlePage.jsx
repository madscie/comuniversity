import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiCalendar, FiEye, FiClock, FiTag, FiBook } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import axios from "axios";

const SingleArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Article ID from URL:", id);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ACTUAL API CALL - FIXED
      const response = await axios.get(`http://localhost:5000/api/articles/${id}`);
      console.log("Single article API response:", response.data);
      
      if (response.data.success) {
        setArticle(response.data.data.article);
      } else {
        throw new Error(response.data.message || 'Article not found');
      }
      
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Failed to load article. Please try again.");
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full mb-4 w-16 h-16 mx-auto flex items-center justify-center">
            <FiBook className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-500 text-lg mb-4">{error || "Article not found."}</p>
          <Button variant="primary" onClick={() => navigate('/articles')}>
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-5xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/articles')}
          className="mb-8 flex items-center hover:scale-105 transition-transform duration-300"
        >
          <FiArrowLeft className="mr-2" /> Back to Articles
        </Button>

        {/* Article Card */}
        <Card className="p-10 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl">
          {/* Featured Badge */}
          {article.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
              FEATURED ARTICLE
            </div>
          )}

          {/* Title with gradient accent */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {article.title}
            </span>
          </h1>

          {/* Author + Date + Stats */}
          <div className="flex flex-wrap gap-6 text-gray-600 text-sm mb-10">
            <span className="flex items-center">
              <FiUser className="mr-2 text-blue-500" /> 
              <span className="font-medium">By {article.author}</span>
            </span>
            <span className="flex items-center">
              <FiCalendar className="mr-2 text-purple-500" /> 
              {formatDate(article.published_date)}
            </span>
            <span className="flex items-center">
              <FiClock className="mr-2 text-green-500" /> 
              {article.read_time} min read
            </span>
            <span className="flex items-center">
              <FiEye className="mr-2 text-orange-500" /> 
              {article.views} views
            </span>
            <span className="flex items-center">
              <FiBook className="mr-2 text-red-500" /> 
              {article.category}
            </span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                >
                  <FiTag className="mr-1" size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price if applicable */}
          {article.amount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
              <span className="text-green-800 font-bold text-lg">Premium Article - ${article.amount}</span>
            </div>
          )}

          {/* Image */}
          {article.image_url && (
            <div className="mb-10">
              <img
                src={`http://localhost:5000${article.image_url}`}
                alt={article.title}
                className="w-full h-96 object-cover rounded-2xl shadow-md"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            <div className="whitespace-pre-line">
              {article.content}
            </div>
          </div>

          {/* File Download if available */}
          {article.file_url && (
            <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-2">Download Article</h3>
              <p className="text-blue-700 mb-4">
                This article is available for download as {article.file_type || 'a file'} 
                {article.file_size && ` (${Math.round(article.file_size / 1024)} KB)`}.
              </p>
              <Button 
                variant="gradient"
                onClick={() => window.open(`http://localhost:5000${article.file_url}`, '_blank')}
                className="flex items-center"
              >
                <FiBook className="mr-2" />
                Download {article.file_name || 'File'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SingleArticlePage;