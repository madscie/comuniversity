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
  FiExternalLink
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { articlesAPI } from "../../config/api";

const SingleArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  console.log("Article ID from URL:", id);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await articlesAPI.getById(id);
      console.log("Single article API response:", response);
      
      if (response.success) {
        setArticle(response.data.article);
      } else {
        throw new Error(response.message || 'Article not found');
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

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📕';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📄';
    if (fileType?.includes('text')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeName = (fileType) => {
    if (fileType?.includes('pdf')) return 'PDF Document';
    if (fileType?.includes('word') || fileType?.includes('document')) return 'Word Document';
    if (fileType?.includes('text')) return 'Text File';
    if (fileType?.includes('rtf')) return 'Rich Text File';
    return 'Document';
  };

  const handleDownload = async () => {
    if (article?.file_url) {
      setDocumentLoading(true);
      try {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = `http://localhost:5000${article.file_url}`;
        link.target = '_blank';
        link.download = article.file_name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Error downloading document:", err);
        alert("Failed to download document. Please try again.");
      } finally {
        setDocumentLoading(false);
      }
    }
  };

  const handleViewDocument = () => {
    if (article?.file_url) {
      window.open(`http://localhost:5000${article.file_url}`, '_blank');
    }
  };

  // Function to check if content is base64 encoded (for PDF preview)
  const isBase64 = (str) => {
    if (!str) return false;
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
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

          {/* DOCUMENT DOWNLOAD SECTION */}
          {article.file_url && (
            <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">
                    {getFileIcon(article.file_type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-1">
                      Download Article Document
                    </h3>
                    <p className="text-blue-700 mb-2">
                      This article includes a downloadable {getFileTypeName(article.file_type)}
                      {article.file_size && ` (${formatFileSize(article.file_size)})`}
                    </p>
                    <p className="text-blue-600 text-sm">
                      File: {article.file_name || 'document'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="gradient"
                    onClick={handleViewDocument}
                    className="flex items-center whitespace-nowrap"
                    disabled={documentLoading}
                  >
                    <FiExternalLink className="mr-2" />
                    {documentLoading ? "Opening..." : "View Document"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleDownload}
                    className="flex items-center whitespace-nowrap border-blue-300 text-blue-700 hover:bg-blue-50"
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
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            {article.content ? (
              <div className="whitespace-pre-line">
                {article.content}
              </div>
            ) : article.file_url ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <FiFile className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Document-Based Article
                </h3>
                <p className="text-gray-600 mb-6">
                  This article's content is available as a downloadable document. 
                  Please use the download or view options above to access the full content.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="gradient"
                    onClick={handleViewDocument}
                    className="flex items-center"
                    disabled={documentLoading}
                  >
                    <FiExternalLink className="mr-2" />
                    {documentLoading ? "Opening..." : "View Document"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleDownload}
                    className="flex items-center"
                    disabled={documentLoading}
                  >
                    <FiDownload className="mr-2" />
                    {documentLoading ? "Downloading..." : "Download Document"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500 italic">
                  No content available for this article.
                </p>
              </div>
            )}
          </div>

          {/* Additional document info */}
          {article.file_url && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <FiFile className="mr-2 text-gray-500" />
                Document Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">File Name:</span> {article.file_name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">File Type:</span> {getFileTypeName(article.file_type)}
                </div>
                <div>
                  <span className="font-medium">File Size:</span> {formatFileSize(article.file_size)}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {article.file_type || 'N/A'}
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