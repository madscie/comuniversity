import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiEye,
  FiClock,
  FiTag,
  FiBook,
  FiType,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import DocumentViewer from "../../utils/DocumentViewer";
import { articleService } from "../../services/articleService";
import { formatDate } from "../../utils/dateHelper";
import { getImageUrl, handleImageError } from "../../utils/helpers";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
      {message}
    </p>
  </div>
);

const SingleArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getArticleById(id);

      if (response.success) {
        setArticle(response.data.article || response.data);
      } else {
        throw new Error(response.message || "Article not found");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Failed to load article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasTextContent =
    article?.content &&
    article.content.trim() !== "" &&
    article.content !== "optional";

  const hasFileContent = article?.file_url;

  const renderContent = () => {
    if (hasTextContent) {
      return (
        <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-300 leading-relaxed">
          <div className="whitespace-pre-line bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            {article.content}
          </div>
        </div>
      );
    }

    if (hasFileContent) {
      return (
        <div className="space-y-6">
          <DocumentViewer
            document={article}
            loading={documentLoading}
            title={hasTextContent ? "Additional Document" : "Article Document"}
            description={
              hasTextContent
                ? "This article also includes a downloadable document"
                : "This article's content is available as a downloadable document"
            }
          />

          {/* {!hasTextContent && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Document-Based Article
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                This article's content is available as a downloadable document.
                Please use the view or download options above to access the full
                content.
              </p>
            </div>
          )} */}
        </div>
      );
    }

    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <p className="text-gray-500 dark:text-gray-400 italic">
          No content available for this article.
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner message="Loading article..." />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4 w-16 h-16 mx-auto flex items-center justify-center">
            <FiBook className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-500 dark:text-red-400 text-lg mb-4">
            {error || "Article not found."}
          </p>
          <Button variant="primary" onClick={() => navigate("/articles")}>
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="outline"
          onClick={() => navigate("/articles")}
          className="mb-8 flex items-center hover:scale-105 transition-all duration-300"
        >
          <FiArrowLeft className="mr-2" /> Back to Articles
        </Button>

        <Card className="p-6 md:p-10 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl border-0">
          {/* Featured Badge */}
          {article.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
              FEATURED ARTICLE
            </div>
          )}

          {/* Content Type Indicator */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <div
              className={`flex items-center px-3 py-1 rounded-full ${
                hasTextContent
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
              }`}
            >
              {hasTextContent ? (
                <FiType className="mr-1" />
              ) : (
                <FiBook className="mr-1" />
              )}
              {hasTextContent ? "Text Article" : "Document Article"}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 md:gap-6 text-gray-600 dark:text-gray-400 text-sm mb-6">
            <span className="flex items-center">
              <FiUser className="mr-2 text-green-500" />
              <span className="font-medium">By {article.author}</span>
            </span>
            <span className="flex items-center">
              <FiCalendar className="mr-2 text-green-500" />
              {formatDate(article.published_date)}
            </span>
            <span className="flex items-center">
              <FiClock className="mr-2 text-green-500" />
              {article.read_time} min read
            </span>
            <span className="flex items-center">
              <FiEye className="mr-2 text-green-500" />
              {article.views} views
            </span>
            <span className="flex items-center">
              <FiBook className="mr-2 text-green-500" />
              {article.category}
            </span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                >
                  <FiTag className="mr-1" size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          {article.amount > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8 text-center">
              <span className="text-green-800 dark:text-green-300 font-bold text-lg">
                Premium Article - ${article.amount}
              </span>
            </div>
          )}

          {/* Image */}
          {article.image_url && (
            <div className="mb-8">
              <img
                src={getImageUrl(article.image_url)}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-md"
                onError={handleImageError}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="mt-8">{renderContent()}</div>
        </Card>
      </div>
    </div>
  );
};

export default SingleArticlePage;
