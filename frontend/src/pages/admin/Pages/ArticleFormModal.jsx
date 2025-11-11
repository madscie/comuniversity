// src/pages/admin/ArticleFormModal.jsx
import { useState, useEffect } from "react";
import {
  FiX,
  FiFileText,
  FiUser,
  FiTag,
  FiClock,
  FiImage,
  FiUpload,
  FiEye,
  FiStar,
  FiFile,
  FiDownload,
  FiTrash2,
  FiDollarSign,
  FiBook
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const ArticleFormModal = ({ isOpen, onClose, article, onSave, isLoading, categories }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    readTime: "5",
    status: "draft",
    tags: "",
    featured: false,
    deweyDecimal: "",
    amount: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ];

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        author: article.author || "",
        category: article.category || "",
        readTime: article.read_time?.toString() || "5",
        status: article.status || "draft",
        tags: article.tags ? article.tags.join(', ') : "",
        featured: article.featured || false,
        deweyDecimal: article.dewey_decimal || "",
        amount: article.amount ? parseFloat(article.amount).toString() : ""
      });
      
      if (article.image_url) {
        setImagePreview(article.image_url);
      }
      
      if (article.file_url) {
        setDocumentPreview({
          name: article.file_name || "document",
          type: article.file_type || "application/pdf",
          size: article.file_size || 0,
          url: article.file_url
        });
      }
    } else {
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        author: "",
        category: "",
        readTime: "5",
        status: "draft",
        tags: "",
        featured: false,
        deweyDecimal: "",
        amount: ""
      });
      setImageFile(null);
      setImagePreview("");
      setDocumentFile(null);
      setDocumentPreview(null);
    }
    setErrors({});
  }, [article, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: "Please select a valid image file (JPEG, PNG, GIF, WebP)"
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: "Image size should be less than 5MB"
        }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!allowedFileTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          document: "Please select a valid document file (PDF, DOC, DOCX, TXT, RTF)"
        }));
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          document: "File size should be less than 50MB"
        }));
        return;
      }

      setDocumentFile(file);
      setErrors(prev => ({ ...prev, document: "" }));

      setDocumentPreview({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const removeDocument = () => {
    setDocumentFile(null);
    if (documentPreview?.url) {
      URL.revokeObjectURL(documentPreview.url);
    }
    setDocumentPreview(null);
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word') || fileType.includes('document')) return '📄';
    if (fileType.includes('text')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Content is now optional since we can upload files
    if (!formData.content.trim() && !documentFile && !documentPreview) {
      newErrors.content = "Either content or a document file is required";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = "Excerpt must be less than 200 characters";
    }

    if (!formData.readTime || formData.readTime < 1) {
      newErrors.readTime = "Read time must be at least 1 minute";
    }

    // Validate amount if provided
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      newErrors.amount = "Amount must be a valid number";
    }

    // Validate Dewey Decimal format (optional)
    if (formData.deweyDecimal && !/^[0-9.]*$/.test(formData.deweyDecimal)) {
      newErrors.deweyDecimal = "Dewey Decimal must contain only numbers and dots";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        readTime: parseInt(formData.readTime)
      };

      // Handle image upload
      if (imageFile) {
        submissionData.imageFile = imageFile;
      }

      // Handle document upload
      if (documentFile) {
        submissionData.documentFile = documentFile;
      }

      await onSave(submissionData, article?.id);
      onClose();
    } catch (error) {
      console.error("Error saving article:", error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || "Failed to save article. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <FiFileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {article ? "Edit Article" : "Create New Article"}
                </h2>
                <p className="text-blue-100 opacity-90 text-sm">
                  {article ? "Update article content" : "Write a new blog article or upload document"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 transform hover:scale-110"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 bg-gray-50">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Basic Info */}
              <div className="xl:col-span-2 space-y-6">
                {/* Title Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiFileText className="mr-2 h-4 w-4 text-blue-500" />
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.title 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter article title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Excerpt Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Excerpt *
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      {formData.excerpt.length}/200 characters
                    </span>
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows="3"
                    maxLength="200"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 resize-none hover:border-gray-300 ${
                      errors.excerpt ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="Brief description of the article (max 200 characters)"
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.excerpt}
                    </p>
                  )}
                </div>

                {/* Content Field - Now Optional */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Content
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      (Optional if you upload a document file)
                    </span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="8"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 resize-none hover:border-gray-300 ${
                      errors.content ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="Write your article content here... (or upload a document file below)"
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Media & Details */}
              <div className="space-y-6">
                {/* Featured Image Upload */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <FiImage className="mr-2 h-4 w-4 text-blue-500" />
                    Featured Image
                    <span className="text-xs text-gray-500 ml-2 font-normal">(Optional)</span>
                  </label>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex-shrink-0 h-32 w-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 hover:border-blue-400 hover:shadow-md">
                      {imagePreview ? (
                        <div className="relative h-full w-full group">
                          <img
                            src={imagePreview}
                            alt="Article preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={removeImage}
                              className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">No image</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm">
                        <FiUpload className="mr-2 h-4 w-4" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-600 mt-3">
                        Supports: JPEG, PNG, GIF, WebP<br />
                        Max size: 5MB
                      </p>
                    </div>
                  </div>
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-3 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.image}
                    </p>
                  )}
                </div>

                {/* Document Upload Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <FiFile className="mr-2 h-4 w-4 text-green-500" />
                    Document File
                    <span className="text-xs text-gray-500 ml-2 font-normal">(Optional - Alternative to typing content)</span>
                  </label>
                  
                  {documentPreview ? (
                    <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {getFileIcon(documentPreview.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {documentPreview.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatFileSize(documentPreview.size)} • {documentPreview.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {documentPreview.url && (
                            <a
                              href={documentPreview.url}
                              download={documentPreview.name}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                              title="Download"
                            >
                              <FiDownload className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={removeDocument}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Remove"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 hover:border-green-400 hover:shadow-md">
                      <FiFile className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-3 text-center">
                        Upload a document file (PDF, DOC, DOCX)<br />
                        This is an alternative to typing content
                      </p>
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm">
                        <FiUpload className="mr-2 h-4 w-4" />
                        Upload Document
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.rtf"
                          onChange={handleDocumentChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Supports: PDF, DOC, DOCX, TXT, RTF<br />
                        Max size: 50MB
                      </p>
                    </div>
                  )}
                  
                  {errors.document && (
                    <p className="text-red-500 text-sm mt-3 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.document}
                    </p>
                  )}
                </div>

                {/* Dewey Decimal Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiBook className="mr-2 h-4 w-4 text-purple-500" />
                    Dewey Decimal
                    <span className="text-xs text-gray-500 ml-2 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="deweyDecimal"
                    value={formData.deweyDecimal}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.deweyDecimal 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g., 025.431, 005.133"
                  />
                  {errors.deweyDecimal && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.deweyDecimal}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Library classification number
                  </p>
                </div>

                {/* Amount Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiDollarSign className="mr-2 h-4 w-4 text-green-500" />
                    Amount
                    <span className="text-xs text-gray-500 ml-2 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.amount 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.amount}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Price or cost associated with the article
                  </p>
                </div>

                {/* Author Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiUser className="mr-2 h-4 w-4 text-green-500" />
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.author 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter author name"
                  />
                  {errors.author && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.author}
                    </p>
                  )}
                </div>

                {/* Category Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiTag className="mr-2 h-4 w-4 text-orange-500" />
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 appearance-none bg-white ${
                      errors.category 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Read Time Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiClock className="mr-2 h-4 w-4 text-purple-500" />
                    Read Time (minutes) *
                  </label>
                  <input
                    type="number"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    min="1"
                    max="60"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.readTime 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {errors.readTime && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.readTime}
                    </p>
                  )}
                </div>

                {/* Tags Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Separate multiple tags with commas (e.g., technology, education, science)
                  </p>
                </div>

                {/* Status Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiEye className="mr-2 h-4 w-4 text-green-500" />
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">📢 Published</option>
                  </select>
                </div>

                {/* Featured Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full ${formData.featured ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.featured ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="flex items-center">
                      <FiStar className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Featured Article</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-600 mt-2">
                    Featured articles will be highlighted on the homepage
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm flex items-center">
                  <FiX className="mr-2 h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Fields marked with * are required. Either content or document file is required.
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || isLoading}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none rounded-xl"
                >
                  {(isSubmitting || isLoading) ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {article ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    article ? "Update Article" : "Create Article"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArticleFormModal;