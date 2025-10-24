// src/pages/admin/ManageArticlesPage.jsx
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
  FiDollarSign,
  FiBook
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import ArticleFormModal from "./ArticleFormModal";
import { api } from "../../../config/api";

const ManageArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

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
    "Other"
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminArticles();
      if (response.success) {
        setArticles(response.data.articles || []);
      } else {
        console.error('Failed to load articles:', response.message);
        setArticles([]);
      }
    } catch (error) {
      console.error("Error loading articles:", error);
      setArticles([]);
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
      // Prepare data for API - ensure all fields are properly formatted
      const submissionData = {
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        author: articleData.author,
        category: articleData.category,
        read_time: parseInt(articleData.readTime) || 5,
        status: articleData.status,
        featured: Boolean(articleData.featured),
        tags: articleData.tags ? articleData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
        dewey_decimal: articleData.deweyDecimal || null,
        amount: articleData.amount ? parseFloat(articleData.amount) : null
      };

      console.log('💾 Saving article with data:', submissionData);

      // Handle image upload if available
      if (articleData.imageFile) {
        try {
          console.log('🖼️ Uploading article image...');
          const uploadResponse = await api.uploadArticleImage(articleData.imageFile);
          if (uploadResponse.success) {
            submissionData.image_url = uploadResponse.data.imageUrl;
            console.log('✅ Image uploaded:', uploadResponse.data.imageUrl);
          }
        } catch (uploadError) {
          console.error('❌ Error uploading image:', uploadError);
          // Continue without image - don't throw error
        }
      }

      // Handle document upload if available
      if (articleData.documentFile) {
        try {
          console.log('📄 Uploading article document...');
          const uploadResponse = await api.uploadArticleDocument(articleData.documentFile);
          if (uploadResponse.success) {
            submissionData.file_url = uploadResponse.data.fileUrl;
            submissionData.file_name = uploadResponse.data.fileName;
            submissionData.file_type = uploadResponse.data.fileType;
            submissionData.file_size = uploadResponse.data.fileSize;
            console.log('✅ Document uploaded:', uploadResponse.data.fileUrl);
          }
        } catch (uploadError) {
          console.error('❌ Error uploading document:', uploadError);
          // Continue without document - don't throw error
        }
      }

      let response;
      if (articleId) {
        console.log(`🔄 Updating existing article: ${articleId}`);
        response = await api.updateArticle(articleId, submissionData);
      } else {
        console.log('🆕 Creating new article');
        response = await api.createArticle(submissionData);
      }

      if (response.success) {
        console.log('✅ Article saved successfully');
        await loadArticles();
        return response;
      } else {
        console.error('❌ Save failed:', response.message);
        throw new Error(response.message || 'Failed to save article');
      }
    } catch (error) {
      console.error("💥 Error in handleSaveArticle:", error);
      throw new Error(error.message || "Failed to save article. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (article.dewey_decimal && article.dewey_decimal.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || article.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" || article.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = async (articleId) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const response = await api.deleteArticle(articleId);
        if (response.success) {
          setArticles(articles.filter((article) => article.id !== articleId));
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting article:", error);
        alert("Failed to delete article. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const article = articles.find(a => a.id === id);
      const newStatus = article.status === "published" ? "draft" : "published";
      
      const response = await api.updateArticle(id, { 
        status: newStatus,
        published_date: newStatus === "published" ? new Date().toISOString().split('T')[0] : null
      });
      
      if (response.success) {
        setArticles(
          articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  status: newStatus,
                  published_date: newStatus === "published" ? new Date().toISOString().split('T')[0] : article.published_date
                }
              : article
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating article status:", error);
      alert("Failed to update article status. Please try again.");
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const article = articles.find(a => a.id === id);
      const newFeatured = !article.featured;
      
      const response = await api.updateArticle(id, { 
        featured: newFeatured
      });
      
      if (response.success) {
        setArticles(
          articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  featured: newFeatured
                }
              : article
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      alert("Failed to update featured status. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    return status === "published"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getCategoryBadge = (category) => {
    const styles = {
      Technology: "bg-blue-100 text-blue-800",
      Education: "bg-purple-100 text-purple-800",
      Science: "bg-green-100 text-green-800",
      Health: "bg-red-100 text-red-800",
      Business: "bg-indigo-100 text-indigo-800",
      Arts: "bg-pink-100 text-pink-800",
      Literature: "bg-orange-100 text-orange-800",
      History: "bg-amber-100 text-amber-800",
      Travel: "bg-teal-100 text-teal-800",
      Lifestyle: "bg-cyan-100 text-cyan-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return styles[category] || "bg-gray-100 text-gray-800";
  };

  // Calculate statistics
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.status === "published").length;
  const draftArticles = articles.filter(a => a.status === "draft").length;
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const featuredArticles = articles.filter(a => a.featured).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Articles</h1>
          <p className="text-gray-600">Create, edit, and publish blog articles</p>
        </div>
        <Button onClick={handleAddArticle}>
          <FiPlus className="mr-2" />
          New Article
        </Button>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="p-6 text-center">
          <FiFileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalArticles}</div>
          <div className="text-sm text-gray-600">Total Articles</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{publishedArticles}</div>
          <div className="text-sm text-gray-600">Published</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{draftArticles}</div>
          <div className="text-sm text-gray-600">Drafts</div>
        </Card>
        <Card className="p-6 text-center">
          <FiBarChart2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalViews}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{featuredArticles}</div>
          <div className="text-sm text-gray-600">Featured</div>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dewey Decimal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {articles.length === 0 ? "No articles found" : "No matching articles"}
                      </h3>
                      <p className="text-gray-600">
                        {articles.length === 0
                          ? "Get started by creating your first article."
                          : "Try changing your search or filter criteria."}
                      </p>
                      {articles.length === 0 && (
                        <Button onClick={handleAddArticle} className="mt-4">
                          <FiPlus className="mr-2" />
                          Create Your First Article
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                          {article.image_url ? (
                            <img 
                              src={article.image_url} 
                              alt={article.title}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <FiFileText className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {article.title}
                            {article.featured && (
                              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Featured
                              </span>
                            )}
                            {article.file_url && (
                              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                                <FiFileText className="h-3 w-3 mr-1" />
                                Document
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {article.excerpt || "No excerpt available"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                        {article.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadge(
                          article.category
                        )}`}
                      >
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FiBook className="h-4 w-4 text-gray-400 mr-2" />
                        {article.dewey_decimal || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FiDollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        {article.amount ? `$${parseFloat(article.amount).toFixed(2)}` : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          article.status
                        )}`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FiBarChart2 className="h-4 w-4 text-gray-400 mr-2" />
                        {article.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(article.id)}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          article.status === "published"
                            ? "text-yellow-600 hover:text-yellow-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        title={article.status === "published" ? "Mark as draft" : "Publish article"}
                      >
                        {article.status === "published" ? "Draft" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(article.id)}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          article.featured
                            ? "text-gray-600 hover:text-gray-900"
                            : "text-purple-600 hover:text-purple-900"
                        }`}
                        title={article.featured ? "Remove featured" : "Mark as featured"}
                      >
                        {article.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button 
                        onClick={() => handleEditArticle(article)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit article"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-900 p-1"
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