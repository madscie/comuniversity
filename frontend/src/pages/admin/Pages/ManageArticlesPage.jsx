import { useState, useEffect } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiEye,
  FiFileText,
  FiUser,
  FiTag,
  FiCalendar,
  FiBarChart2,
  FiBook,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import ArticleFormModal from "./ArticleFormModal";
import { articleService } from "../../../services/articleService";
import { getImageUrl } from "../../../utils/helpers";

const ManageArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    "Technology",
    "Education",
    "Science",
    "Health",
    "Business",
    "Arts",
    "Literature",
    "History",
    "Travel",
    "Lifestyle",
    "Other",
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("📄 Loading articles...");
      const response = await articleService.getArticles();
      console.log("📥 Articles API response:", response);

      if (response.success) {
        const articlesData = response.data?.articles || response.data || [];
        console.log(`✅ Loaded ${articlesData.length} articles:`, articlesData);
        setArticles(articlesData);
      } else {
        console.error("❌ Failed to load articles:", response.message);
        setError(response.message || "Failed to load articles");
        setArticles([]);
        toast.error("❌ Failed to load articles: " + response.message);
      }
    } catch (error) {
      console.error("💥 Error loading articles:", error);
      setError("Failed to load articles. Please try again.");
      setArticles([]);
      toast.error("❌ Error loading articles: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddArticle = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleSaveArticle = async (articleData, articleId) => {
    setSaveLoading(true);
    try {
      console.log("💾 Saving article data:", articleData);
      console.log("📝 Article ID (if editing):", articleId);

      // Prepare data for API - FIXED: Handle tags properly
      const submissionData = {
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        author: articleData.author,
        category: articleData.category,
        read_time: parseInt(articleData.readTime) || 5,
        status: articleData.status,
        featured: Boolean(articleData.featured),
        dewey_decimal: articleData.deweyDecimal || null,
        // REMOVED: amount field completely - articles are free
      };

      // FIXED: Handle tags properly - check if it's already an array or needs processing
      if (articleData.tags) {
        if (Array.isArray(articleData.tags)) {
          // If it's already an array, use it directly
          submissionData.tags = articleData.tags;
        } else if (typeof articleData.tags === "string") {
          // If it's a string, split it into an array
          submissionData.tags = articleData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "");
        }
      } else {
        // If no tags provided, use empty array
        submissionData.tags = [];
      }

      console.log("📤 Submission data:", submissionData);

      let response;
      if (articleId) {
        console.log("🔄 Updating existing article...");
        response = await articleService.updateArticle(articleId, {
          ...submissionData,
          imageFile: articleData.imageFile,
          documentFile: articleData.documentFile,
        });
      } else {
        console.log("🆕 Creating new article...");
        response = await articleService.createArticle({
          ...submissionData,
          imageFile: articleData.imageFile,
          documentFile: articleData.documentFile,
        });
      }

      console.log("📥 Save response:", response);

      if (response.success) {
        await loadArticles();
        toast.success(
          articleId
            ? "Article updated successfully!"
            : "Article added successfully!"
        );
        return response;
      } else {
        throw new Error(response.message || "Failed to save article");
      }
    } catch (error) {
      console.error("❌ Error saving article:", error);
      let errorMessage = "Failed to save article. Please try again.";
      if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.data?.error) {
        errorMessage = error.data.error;
      }
      toast.error(errorMessage);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const response = await articleService.deleteArticle(id);
        if (response.success) {
          setArticles(articles.filter((article) => article.id !== id));
          toast.success("Article deleted successfully!");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting article:", error);
        toast.error("Failed to delete article. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const article = articles.find((a) => a.id === id);
      const newStatus = article.status === "published" ? "draft" : "published";

      const response = await articleService.updateArticle(id, {
        status: newStatus,
        published_date:
          newStatus === "published"
            ? new Date().toISOString().split("T")[0]
            : null,
      });

      if (response.success) {
        setArticles(
          articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  status: newStatus,
                  published_date:
                    newStatus === "published"
                      ? new Date().toISOString().split("T")[0]
                      : article.published_date,
                }
              : article
          )
        );
        toast.success(`Article marked as ${newStatus}!`);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating article status:", error);
      toast.error("Failed to update article status. Please try again.");
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const article = articles.find((a) => a.id === id);
      const newFeatured = !article.featured;

      const response = await articleService.updateArticle(id, {
        featured: newFeatured,
      });

      if (response.success) {
        setArticles(
          articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  featured: newFeatured,
                }
              : article
          )
        );
        toast.success(
          newFeatured ? "Article featured!" : "Article unfeatured!"
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status. Please try again.");
    }
  };

  // Helper function to render article image with proper URL handling
  const renderArticleImage = (article) => {
    const imageUrl = getImageUrl(article.image_url);

    return (
      <div className="relative flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center overflow-hidden cursor-pointer">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={article.title}
              className="h-10 w-10 object-cover"
              onError={(e) => {
                console.error(
                  `❌ Failed to load image for article ${article.id}:`,
                  imageUrl
                );
                e.target.style.display = "none";
                const fallback = e.target.nextSibling;
                if (fallback) {
                  fallback.classList.remove("hidden");
                }
              }}
              onLoad={(e) => {
                console.log(
                  `✅ Image loaded successfully for article ${article.id}:`,
                  imageUrl
                );
                const fallback = e.target.nextSibling;
                if (fallback) {
                  fallback.classList.add("hidden");
                }
              }}
            />
            <div className="image-fallback absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <FiFileText className="h-5 w-5 text-blue-600" />
            </div>
          </>
        ) : (
          <FiFileText className="h-5 w-5 text-blue-600" />
        )}
      </div>
    );
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.excerpt &&
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (article.dewey_decimal &&
        article.dewey_decimal.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || article.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" || article.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    return status === "published"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const getCategoryBadge = (category) => {
    const styles = {
      Technology:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Education:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Science:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Business:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      Arts: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Literature:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      History:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      Travel: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      Lifestyle:
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return (
      styles[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  // Calculate statistics
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(
    (a) => a.status === "published"
  ).length;
  const draftArticles = articles.filter((a) => a.status === "draft").length;
  const totalViews = articles.reduce(
    (sum, article) => sum + (article.views || 0),
    0
  );
  const featuredArticles = articles.filter((a) => a.featured).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and publish blog articles
          </p>
        </div>
        <Button onClick={handleAddArticle} className="cursor-pointer">
          <FiPlus className="mr-2" />
          New Article
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <Button
            variant="primary"
            onClick={loadArticles}
            className="mt-2 cursor-pointer"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="p-6 text-center cursor-default">
          <FiFileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalArticles}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Articles
          </div>
        </Card>
        <Card className="p-6 text-center cursor-default">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {publishedArticles}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Published
          </div>
        </Card>
        <Card className="p-6 text-center cursor-default">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {draftArticles}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
        </Card>
        <Card className="p-6 text-center cursor-default">
          <FiBarChart2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalViews}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Views
          </div>
        </Card>
        <Card className="p-6 text-center cursor-default">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {featuredArticles}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Featured
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles by title, author, content, or Dewey Decimal..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      {/* Articles Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-default">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-default">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-default">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-default">
                  Dewey Decimal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-default">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-default">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-default">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center cursor-default"
                  >
                    <div className="text-gray-500 dark:text-gray-400">
                      <FiFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {articles.length === 0
                          ? "No articles found"
                          : "No matching articles"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {articles.length === 0
                          ? "Get started by creating your first article."
                          : "Try changing your search or filter criteria."}
                      </p>
                      {articles.length === 0 && (
                        <Button
                          onClick={handleAddArticle}
                          className="mt-4 cursor-pointer"
                        >
                          <FiPlus className="mr-2" />
                          Create Your First Article
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-default"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {renderArticleImage(article)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                            {article.title}
                            {article.featured && (
                              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full cursor-default">
                                Featured
                              </span>
                            )}
                            {article.file_url && (
                              <span className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center cursor-default">
                                <FiFileText className="h-3 w-3 mr-1" />
                                Document
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 cursor-default">
                            {article.excerpt || "No excerpt available"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-default">
                      <div className="flex items-center">
                        <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                        {article.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-default">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadge(
                          article.category
                        )}`}
                      >
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-default">
                      <div className="flex items-center">
                        <FiBook className="h-4 w-4 text-gray-400 mr-2" />
                        {article.dewey_decimal || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-default">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          article.status
                        )}`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-default">
                      <div className="flex items-center">
                        <FiBarChart2 className="h-4 w-4 text-gray-400 mr-2" />
                        {article.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(article.id)}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer ${
                          article.status === "published"
                            ? "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        }`}
                        title={
                          article.status === "published"
                            ? "Mark as draft"
                            : "Publish article"
                        }
                      >
                        {article.status === "published" ? "Draft" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(article.id)}
                        className={`inline-flex items-center cursor-pointer px-2 py-1 rounded text-xs ${
                          article.featured
                            ? "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            : "text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        }`}
                        title={
                          article.featured
                            ? "Remove featured"
                            : "Mark as featured"
                        }
                      >
                        {article.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="text-blue-600 cursor-pointer hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="Edit article"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-600 cursor-pointer hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Delete article"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Article Form Modal */}
      <ArticleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        article={selectedArticle}
        onSave={handleSaveArticle}
        isLoading={saveLoading}
        categories={categories}
      />
    </div>
  );
};

export default ManageArticlesPage;
