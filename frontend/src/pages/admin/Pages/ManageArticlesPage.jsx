// src/pages/admin/ArticleFormModal.jsx
import { useState, useEffect } from "react";
import {
  FiX,
  FiUpload,
  FiFileText,
  FiDollarSign,
  FiClock,
  FiTag,
  FiUser,
  FiBook
} from "react-icons/fi";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";

const ArticleFormModal = ({
  isOpen,
  onClose,
  article,
  onSave,
  isLoading,
  categories
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    dewey_decimal: "",
    price: "0.00",
    is_premium: false,
    readTime: "5",
    status: "draft",
    featured: false,
    tags: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        author: article.author || "",
        category: article.category || "",
        dewey_decimal: article.dewey_decimal || "",
        price: parseFloat(article.price || 0).toFixed(2),
        is_premium: Boolean(article.is_premium),
        readTime: article.read_time?.toString() || "5",
        status: article.status || "draft",
        featured: Boolean(article.featured),
        tags: Array.isArray(article.tags) ? article.tags.join(", ") : (article.tags || "")
      });
      setImagePreview(article.image_url || "");
      setDocumentPreview(article.file_url ? article.file_name : "");
    } else {
      // Reset form for new article
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        author: "",
        category: "",
        dewey_decimal: "",
        price: "0.00",
        is_premium: false,
        readTime: "5",
        status: "draft",
        featured: false,
        tags: ""
      });
      setImageFile(null);
      setImagePreview("");
      setDocumentFile(null);
      setDocumentPreview("");
    }
    setErrors({});
  }, [article, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, document: 'Please select a PDF, Word, or text document' }));
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, document: 'Document size must be less than 10MB' }));
        return;
      }

      setDocumentFile(file);
      setErrors(prev => ({ ...prev, document: '' }));
      setDocumentPreview(file.name);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentPreview("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.author.trim()) newErrors.author = "Author is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (formData.dewey_decimal && !/^\d{3}\.\d+$/.test(formData.dewey_decimal)) {
      newErrors.dewey_decimal = "Please enter a valid Dewey Decimal (e.g., 123.45)";
    }
    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(
        {
          ...formData,
          imageFile,
          documentFile
        },
        article?.id
      );
      onClose();
    } catch (error) {
      console.error("Error saving article:", error);
      // Error is handled in the parent component
    }
  };

  const generateExcerpt = () => {
    if (formData.content && !formData.excerpt) {
      const plainText = formData.content.replace(/<[^>]*>/g, '');
      const excerpt = plainText.substring(0, 150).trim() + (plainText.length > 150 ? '...' : '');
      setFormData(prev => ({ ...prev, excerpt }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={article ? "Edit Article" : "Create New Article"}
      size="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter article title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter author name"
                />
              </div>
              {errors.author && (
                <p className="mt-1 text-sm text-red-600">{errors.author}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dewey Decimal Classification
              </label>
              <div className="relative">
                <FiBook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="dewey_decimal"
                  value={formData.dewey_decimal}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dewey_decimal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 123.45"
                />
              </div>
              {errors.dewey_decimal && (
                <p className="mt-1 text-sm text-red-600">{errors.dewey_decimal}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">
                        Upload an image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Document (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {documentPreview ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiFileText className="h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-sm truncate">{documentPreview}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDocument}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FiFileText className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 text-sm">
                        Upload document
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleDocumentChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Word, Text up to 10MB
                    </p>
                  </div>
                )}
              </div>
              {errors.document && (
                <p className="mt-1 text-sm text-red-600">{errors.document}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Read Time (minutes)
            </label>
            <div className="relative">
              <FiClock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                name="readTime"
                min="1"
                value={formData.readTime}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="relative">
            <FiTag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas (e.g., technology, education, science)"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Separate tags with commas
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Excerpt
            </label>
            <button
              type="button"
              onClick={generateExcerpt}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Generate from content
            </button>
          </div>
          <textarea
            name="excerpt"
            rows="3"
            value={formData.excerpt}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the article (will be auto-generated if empty)"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            name="content"
            rows="12"
            value={formData.content}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Write your article content here..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_premium"
              checked={formData.is_premium}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Premium Article</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Featured Article</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : article ? "Update Article" : "Create Article"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ArticleFormModal;