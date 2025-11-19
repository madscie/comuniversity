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
  FiBook,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import FormField from "../../../components/UI/FormField";
import FileUpload from "../../../components/UI/FileUpload";

const ArticleFormModal = ({
  isOpen,
  onClose,
  article,
  onSave,
  isLoading,
  categories,
}) => {
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
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
  ];

  useEffect(() => {
    if (article && isOpen) {
      console.log("📄 Editing article:", article);

      setFormData({
        title: article.title || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        author: article.author || "",
        category: article.category || "",
        readTime: article.read_time?.toString() || "5",
        status: article.status || "draft",
        tags: article.tags ? article.tags.join(", ") : "",
        featured: article.featured || false,
        deweyDecimal: article.dewey_decimal || "",
      });

      if (article.image_url) {
        setImagePreview(article.image_url);
      }

      if (article.file_url) {
        setDocumentPreview({
          name: article.file_name || "document",
          type: article.file_type || "application/pdf",
          size: article.file_size || 0,
          url: article.file_url,
        });
      }
    } else if (isOpen) {
      // Reset form for new article
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
      });
      setImageFile(null);
      setImagePreview("");
      setDocumentFile(null);
      setDocumentPreview(null);
    }

    setErrors({});
    setUploadProgress(0);
    setIsUploading(false);
  }, [article, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (file) => {
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    toast.info("Article image selected. Click save to upload.");
  };

  const handleDocumentChange = (file) => {
    setDocumentFile(file);

    setDocumentPreview({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    });

    toast.info("Document file selected. Click save to upload.");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    toast.info("Article image removed");
  };

  const removeDocument = () => {
    setDocumentFile(null);
    if (documentPreview?.url) {
      URL.revokeObjectURL(documentPreview.url);
    }
    setDocumentPreview(null);
    toast.info("Document file removed");
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("word") || fileType.includes("document")) return "📄";
    if (fileType.includes("text")) return "📝";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title =
        "📝 Article title is required - please enter the article title";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "📝 Article title must be at least 2 characters long";
    }

    if (!formData.author.trim()) {
      newErrors.author =
        "✍️ Author name is required - please enter the author's name";
    } else if (formData.author.trim().length < 2) {
      newErrors.author = "✍️ Author name must be at least 2 characters long";
    }

    if (!formData.category) {
      newErrors.category =
        "🏷️ Category is required - please select a category from the list";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt =
        "📄 Excerpt is required - please provide a brief description";
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = "📄 Excerpt must be less than 200 characters";
    }

    if (!formData.readTime || formData.readTime < 1) {
      newErrors.readTime = "⏱️ Read time must be at least 1 minute";
    } else if (formData.readTime > 60) {
      newErrors.readTime = "⏱️ Read time cannot exceed 60 minutes";
    }

    // Content is now optional since we can upload files
    if (!formData.content.trim() && !documentFile && !documentPreview) {
      newErrors.content = "📝 Either content or a document file is required";
    }

    // Validate Dewey Decimal format (optional)
    if (formData.deweyDecimal && !/^[0-9.\s-]*$/.test(formData.deweyDecimal)) {
      newErrors.deweyDecimal =
        "🔢 Dewey Decimal must contain only numbers, dots, spaces, and dashes";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log("❌ Form validation errors:", newErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const submissionData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        author: formData.author.trim(),
        category: formData.category,
        readTime: parseInt(formData.readTime) || 5,
        status: formData.status,
        featured: Boolean(formData.featured),
        deweyDecimal: formData.deweyDecimal || null,
      };

      // FIXED: Handle tags properly - always send as string to be consistent
      if (formData.tags.trim()) {
        submissionData.tags = formData.tags;
      } else {
        submissionData.tags = ""; // Empty string instead of empty array
      }

      console.log("📤 Starting article save...", submissionData);

      // Simulate upload progress
      setUploadProgress(30);

      // Add files to submission data if they exist
      if (imageFile) {
        submissionData.imageFile = imageFile;
      }

      if (documentFile) {
        submissionData.documentFile = documentFile;
      }

      // Call the save function
      await onSave(submissionData, article?.id);

      setUploadProgress(100);
      toast.success(
        article
          ? "Article updated successfully!"
          : "Article added successfully!"
      );
      onClose();
    } catch (error) {
      console.error("❌ Error saving article:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to save article. Please try again.",
      }));
      toast.error(error.message || "Failed to save article. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
                  {article
                    ? "Update article content and details"
                    : "Write a new blog article or upload document"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 transform hover:scale-110 cursor-pointer"
              disabled={isUploading}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 bg-gray-50">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Images & Basic Info */}
              <div className="xl:col-span-2 space-y-6">
                {/* Cover Image Upload */}
                <FileUpload
                  label="Article Image"
                  type="image"
                  accept="image/*"
                  file={imageFile}
                  preview={imagePreview}
                  onFileChange={handleImageChange}
                  onRemove={removeImage}
                  maxSize={5 * 1024 * 1024}
                  allowedTypes={[
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                  ]}
                  helpText="Supports: JPEG, PNG, GIF, WebP • Max size: 5MB"
                  required={false}
                  disabled={isUploading}
                  error={errors.image}
                />

                {/* Document Upload */}
                <FileUpload
                  label="Document File"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  file={documentFile}
                  preview={documentPreview}
                  onFileChange={handleDocumentChange}
                  onRemove={removeDocument}
                  maxSize={50 * 1024 * 1024}
                  allowedTypes={allowedFileTypes}
                  helpText="Supports: PDF, DOC, DOCX, TXT, RTF • Max size: 50MB • Alternative to typing content"
                  required={false}
                  disabled={isUploading}
                  error={errors.document}
                  showPreviewInfo={true}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                />

                {/* Basic Info Fields */}
                <div className="space-y-4">
                  <FormField
                    label="Title"
                    icon={FiFileText}
                    error={errors.title}
                    required={true}
                  >
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
                      disabled={isUploading}
                    />
                  </FormField>

                  <FormField
                    label="Excerpt"
                    error={errors.excerpt}
                    required={true}
                    helpText={`Brief description of the article (${formData.excerpt.length}/200 characters)`}
                  >
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows="3"
                      maxLength="200"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 resize-none ${
                        errors.excerpt
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Brief description of the article (max 200 characters)"
                      disabled={isUploading}
                    />
                  </FormField>

                  <FormField
                    label="Content"
                    error={errors.content}
                    helpText="Write your article content here (or upload a document file above as an alternative)"
                  >
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows="8"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 resize-none ${
                        errors.content
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Write your article content here... (or upload a document file above)"
                      disabled={isUploading}
                    />
                  </FormField>
                </div>
              </div>

              {/* Right Column - Other Fields */}
              <div className="space-y-6">
                <FormField
                  label="Author"
                  icon={FiUser}
                  error={errors.author}
                  required={true}
                >
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
                    disabled={isUploading}
                  />
                </FormField>

                <FormField
                  label="Category"
                  icon={FiTag}
                  error={errors.category}
                  required={true}
                >
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 appearance-none bg-white ${
                      errors.category
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    disabled={isUploading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Dewey Decimal"
                  icon={FiBook}
                  error={errors.deweyDecimal}
                  helpText="Library classification number (optional)"
                >
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
                    disabled={isUploading}
                  />
                </FormField>

                <FormField
                  label="Read Time (minutes)"
                  icon={FiClock}
                  error={errors.readTime}
                  required={true}
                >
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
                    disabled={isUploading}
                  />
                </FormField>

                <FormField
                  label="Tags"
                  helpText="Separate multiple tags with commas (e.g., technology, education, science)"
                >
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter tags separated by commas"
                    disabled={isUploading}
                  />
                </FormField>

                <FormField label="Status" icon={FiEye}>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
                    disabled={isUploading}
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">📢 Published</option>
                  </select>
                </FormField>

                <FormField label="" className="!p-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isUploading}
                    />
                    <div className="flex items-center ml-2">
                      <FiStar className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-semibold text-gray-800">
                        Featured Article
                      </span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Featured articles will be highlighted on the homepage
                  </p>
                </FormField>
              </div>
            </div>

            {/* Upload Progress Indicator */}
            {(isUploading || uploadProgress > 0) && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {isUploading ? "Uploading Files..." : "Processing..."}
                  </span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Please don't close this window while files are uploading...
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm flex items-center">
                  <FiX className="mr-2 h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                isLoading={isUploading}
              >
                {article ? "Update Article" : "Create Article"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArticleFormModal;
