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
  FiDownload,
  FiFile,
  FiExternalLink,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { articleService } from "../../services/articleService";
import { formatDate } from "../../utils/dateHelper";
import {
  getFileIcon,
  getFileTypeName,
  formatFileSize,
  handleDownload,
  handleViewDocument,
} from "../../utils/fileHelpers";
import { getImageUrl, handleImageError } from "../../utils/helpers";

// Enhanced Loading Spinner
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
      console.log("Single article API response:", response);

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

  const handleDownloadClick = async () => {
    if (!article?.file_url) return;

    setDocumentLoading(true);
    try {
      await handleDownload(article.file_url, article.file_name || "document");
    } catch (err) {
      console.error("Error downloading document:", err);
      alert("Failed to download document. Please try again.");
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleViewDocumentClick = () => {
    if (article?.file_url) {
      handleViewDocument(article.file_url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <LoadingSpinner message="Loading article..." />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full max-w-5xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/articles")}
          className="mb-8 flex items-center hover:scale-105 transition-all duration-300 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Articles
        </Button>

        {/* Article Card */}
        <Card className="p-10 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl border-0 transition-colors duration-300">
          {/* Featured Badge */}
          {article.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
              FEATURED ARTICLE
            </div>
          )}

          {/* Title with gradient accent */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-green-600 dark:from-gray-300 dark:to-green-400">
              {article.title}
            </span>
          </h1>

          {/* Author + Date + Stats */}
          <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400 text-sm my-6">
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

          {/* Price if applicable */}
          {article.amount > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8 text-center">
              <span className="text-green-800 dark:text-green-300 font-bold text-lg">
                Premium Article - ${article.amount}
              </span>
            </div>
          )}

          {/* Image */}
          {article.image_url && (
            <div className="mb-10">
              <img
                src={getImageUrl(article.image_url)}
                alt={article.title}
                className="w-full h-96 object-cover rounded-2xl shadow-md"
                onError={handleImageError}
              />
            </div>
          )}

          {/* DOCUMENT DOWNLOAD SECTION */}
          {article.file_url && (
            <div className="mb-10 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg transition-colors duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">
                    {getFileIcon(article.file_type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-1">
                      Download Article Document
                    </h3>
                    <p className="text-green-700 dark:text-green-400 mb-2">
                      This article includes a downloadable{" "}
                      {getFileTypeName(article.file_type)}
                      {article.file_size &&
                        ` (${formatFileSize(article.file_size)})`}
                    </p>
                    <p className="text-green-600 dark:text-green-500 text-sm">
                      File: {article.file_name || "document"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={handleViewDocumentClick}
                    className="flex items-center whitespace-nowrap"
                    disabled={documentLoading}
                  >
                    <FiExternalLink className="mr-2" />
                    {documentLoading ? "Opening..." : "View Document"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadClick}
                    className="flex items-center whitespace-nowrap border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    disabled={documentLoading}
                  >
                    <FiDownload className="mr-2" />
                    {documentLoading ? "Downloading..." : "Download"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-300 leading-relaxed">
            {article.content ? (
              <div className="whitespace-pre-line">{article.content}</div>
            ) : article.file_url ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <FiFile className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Document-Based Article
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This article's content is available as a downloadable
                  document. Please use the download or view options above to
                  access the full content.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="primary"
                    onClick={handleViewDocumentClick}
                    className="flex items-center"
                    disabled={documentLoading}
                  >
                    <FiExternalLink className="mr-2" />
                    {documentLoading ? "Opening..." : "View Document"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadClick}
                    className="flex items-center border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    disabled={documentLoading}
                  >
                    <FiDownload className="mr-2" />
                    {documentLoading ? "Downloading..." : "Download Document"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No content available for this article.
                </p>
              </div>
            )}
          </div>

          {/* Additional document info */}
          {article.file_url && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <FiFile className="mr-2 text-gray-500 dark:text-gray-400" />
                Document Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">File Name:</span>{" "}
                  {article.file_name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">File Type:</span>{" "}
                  {getFileTypeName(article.file_type)}
                </div>
                <div>
                  <span className="font-medium">File Size:</span>{" "}
                  {formatFileSize(article.file_size)}
                </div>
                <div>
                  <span className="font-medium">Format:</span>{" "}
                  {article.file_type || "N/A"}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SingleArticlePage;
