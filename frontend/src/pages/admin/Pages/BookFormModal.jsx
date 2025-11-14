import { useState, useEffect } from "react";
import {
  FiX,
  FiBook,
  FiUser,
  FiHash,
  FiTag,
  FiCalendar,
  FiUpload,
  FiImage,
  FiFile,
  FiTrash2,
  FiDollarSign,
  FiList,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import { bookService } from "../../../services/bookService";

const BookFormModal = ({ isOpen, onClose, book, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    dewey_number: "",
    price: "0.00",
    published_date: new Date().getFullYear() + "-01-01",
    total_copies: 1,
    description: "",
    publisher: "",
    language: "English",
    pages: "",
    status: "available",
    format: "physical",
    featured: false,
    file_url: "",
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [bookFile, setBookFile] = useState(null);
  const [bookFileName, setBookFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Categories that match the Dewey Decimal system
  const categories = [
    "General Works",
    "Philosophy & Psychology",
    "Religion",
    "Social Sciences",
    "Language",
    "Natural Sciences & Math",
    "Technology & Applied Sciences",
    "Arts & Recreation",
    "Literature",
    "History & Geography",
    "Children's General Works",
    "Children's Philosophy & Psychology",
    "Children's Religion",
    "Children's Social Sciences",
    "Children's Language",
    "Children's Natural Sciences & Math",
    "Children's Technology",
    "Children's Arts & Recreation",
    "Children's Literature",
    "Children's History & Geography",
  ];

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Other",
  ];

  // Dewey Decimal suggestions by category
  const deweySuggestions = {
    "General Works": "000-099",
    "Philosophy & Psychology": "100-199",
    Religion: "200-299",
    "Social Sciences": "300-399",
    Language: "400-499",
    "Natural Sciences & Math": "500-599",
    "Technology & Applied Sciences": "600-699",
    "Arts & Recreation": "700-799",
    Literature: "800-899",
    "History & Geography": "900-999",
    "Children's General Works": "J 000-099",
    "Children's Philosophy & Psychology": "J 100-199",
    "Children's Religion": "J 200-299",
    "Children's Social Sciences": "J 300-399",
    "Children's Language": "J 400-499",
    "Children's Natural Sciences & Math": "J 500-599",
    "Children's Technology": "J 600-699",
    "Children's Arts & Recreation": "J 700-799",
    "Children's Literature": "J 800-899",
    "Children's History & Geography": "J 900-999",
  };

  useEffect(() => {
    if (book) {
      console.log("📖 Editing book:", book);
      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        category: book.category || "",
        dewey_number: book.dewey_number || "",
        price: book.price ? parseFloat(book.price).toString() : "0.00",
        published_date:
          book.published_date || new Date().getFullYear() + "-01-01",
        total_copies: book.total_copies || 1,
        description: book.description || "",
        publisher: book.publisher || "",
        language: book.language || "English",
        pages: book.pages || "",
        status: book.status || "available",
        format: book.format || "physical",
        featured: book.featured || false,
        file_url: book.file_url || "",
      });

      // Set cover preview if cover_image exists - FIXED URL HANDLING
      if (book.cover_image) {
        console.log(
          "🖼️ Setting cover preview from existing book:",
          book.cover_image
        );
        // Ensure the URL is properly formatted
        const imageUrl = book.cover_image.startsWith("http")
          ? book.cover_image
          : `http://localhost:5000${book.cover_image}`;
        setCoverPreview(imageUrl);
      } else {
        setCoverPreview("");
      }

      if (book.file_url) {
        setBookFileName(book.file_url.split("/").pop() || "Existing file");
      }
    } else {
      // Reset form for new book
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        dewey_number: "",
        price: "0.00",
        published_date: new Date().getFullYear() + "-01-01",
        total_copies: 1,
        description: "",
        publisher: "",
        language: "English",
        pages: "",
        status: "available",
        format: "physical",
        featured: false,
        file_url: "",
      });
      setCoverImage(null);
      setCoverPreview("");
      setBookFile(null);
      setBookFileName("");
    }
    setErrors({});
    setUploadProgress(0);
    setIsUploading(false);
  }, [book, isOpen]);

  // Auto-suggest Dewey Decimal when category changes
  useEffect(() => {
    if (
      formData.category &&
      !formData.dewey_number &&
      deweySuggestions[formData.category]
    ) {
      setFormData((prev) => ({
        ...prev,
        dewey_number: deweySuggestions[formData.category],
      }));
    }
  }, [formData.category]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "price") {
      const formattedValue = value.replace(/[^\d.]/g, "");
      const parts = formattedValue.split(".");
      if (parts.length > 2) return;
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
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

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    console.log("🖼️ File selected:", file);

    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
        }));
        toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Image size should be less than 5MB",
        }));
        toast.error("Image size should be less than 5MB");
        return;
      }

      setCoverImage(file);
      setErrors((prev) => ({ ...prev, coverImage: "" }));

      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("🖼️ Setting cover preview from file");
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      toast.info("Cover image selected. Click save to upload.");
    }
  };

  const handleBookFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/epub+zip",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          bookFile: "Please select a valid book file (PDF, EPUB, DOC, DOCX)",
        }));
        toast.error("Please select a valid book file (PDF, EPUB, DOC, DOCX)");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          bookFile: "Book file size should be less than 100MB",
        }));
        toast.error("Book file size should be less than 100MB");
        return;
      }

      setBookFile(file);
      setBookFileName(file.name);
      setErrors((prev) => ({ ...prev, bookFile: "" }));
      toast.info("Book file selected. Click save to upload.");
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview("");
    const fileInput = document.querySelector(
      'input[type="file"][accept="image/*"]'
    );
    if (fileInput) fileInput.value = "";
    toast.info("Cover image removed");
  };

  const removeBookFile = () => {
    setBookFile(null);
    setBookFileName("");
    const fileInput = document.querySelector(
      'input[type="file"][accept=".pdf,.epub,.doc,.docx"]'
    );
    if (fileInput) fileInput.value = "";
    toast.info("Book file removed");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.author.trim()) newErrors.author = "Author is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.dewey_number.trim())
      newErrors.dewey_number = "Dewey Decimal classification is required";
    if (!formData.price || parseFloat(formData.price) < 0)
      newErrors.price = "Price must be a positive number";
    if (!formData.published_date)
      newErrors.published_date = "Published date is required";
    if (!formData.total_copies || formData.total_copies < 1)
      newErrors.total_copies = "Must have at least 1 copy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In BookFormModal component - update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    // Prepare data - SIMPLIFIED VERSION
    const submissionData = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      description: formData.description || "",
      isbn: formData.isbn.trim() === "" ? null : formData.isbn.trim(),
      category: formData.category,
      dewey_number: formData.dewey_number,
      price: parseFloat(formData.price) || 0,
      format: formData.format,
      pages: formData.pages ? parseInt(formData.pages) : null,
      publisher: formData.publisher || "",
      published_date: formData.published_date,
      language: formData.language,
      status: formData.status,
      total_copies: parseInt(formData.total_copies) || 1,
      featured: formData.featured ? 1 : 0,
      // Don't include cover_image and file_url here - they'll be handled as files
    };

    console.log("📤 Starting book save...");

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Add files to submission data if they exist
      if (coverImage) {
        submissionData.coverImage = coverImage;
        setUploadProgress(30);
      }

      if (bookFile) {
        submissionData.bookFile = bookFile;
        setUploadProgress(60);
      }

      setUploadProgress(90);
      console.log("💾 Final data to save:", submissionData);

      // Call the save function - files are now included in submissionData
      await onSave(submissionData, book?.id);

      toast.success(
        book ? "Book updated successfully!" : "Book added successfully!"
      );
      onClose();
    } catch (error) {
      console.error("❌ Error saving book:", error);
      toast.error(error.message || "Failed to save book. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-green-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <FiBook className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {book ? "Edit Book" : "Add New Book"}
                </h2>
                <p className="text-gray-100 opacity-90 text-sm">
                  {book
                    ? "Update book information"
                    : "Add a new book to the library"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 transform hover:scale-110"
              disabled={isUploading}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images & Basic Info */}
              <div className="space-y-6">
                {/* Cover Image Upload */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <FiImage className="mr-2 h-4 w-4 text-green-500" />
                    Cover Image
                    <span className="text-xs text-gray-500 ml-2">
                      (Required)
                    </span>
                  </label>

                  <div className="flex flex-col items-center space-y-4">
                    {/* Image Preview Area */}
                    <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {coverPreview ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(
                                "❌ Failed to load preview image:",
                                coverPreview
                              );
                              e.target.style.display = "none";
                              // Show fallback
                              const fallback = document.createElement("div");
                              fallback.className =
                                "w-full h-full flex items-center justify-center bg-gray-200";
                              fallback.innerHTML =
                                '<div class="text-center text-gray-400"><FiImage class="h-8 w-8 mx-auto mb-2"/><p class="text-xs">Preview failed</p></div>';
                              e.target.parentNode.appendChild(fallback);
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={removeCoverImage}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300"
                              disabled={isUploading}
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <FiImage className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-xs">No cover</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <label
                      className={`cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-green-600 text-white rounded-lg transition-all duration-300 shadow-lg ${
                        isUploading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:from-gray-800 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5"
                      }`}
                    >
                      <FiUpload className="mr-2 h-4 w-4" />
                      {coverPreview ? "Change Cover" : "Upload Cover"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        disabled={isUploading}
                        required={!book?.cover_image && !coverPreview}
                      />
                    </label>

                    <p className="text-xs text-gray-600 text-center">
                      Supports: JPEG, PNG, GIF, WebP
                      <br />
                      Max size: 5MB • Stored in Cloudinary
                    </p>
                  </div>
                </div>

                {/* Book File Upload */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <FiFile className="mr-2 h-4 w-4 text-green-500" />
                    Book File
                    <span className="text-xs text-gray-500 ml-2">
                      (Optional)
                    </span>
                  </label>

                  <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
                    <FiFile className="h-8 w-8 text-gray-400 mx-auto mb-3" />

                    {bookFile ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <FiFile className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              {bookFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Size: {(bookFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeBookFile}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          disabled={isUploading}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-green-600 text-white rounded-lg transition-all duration-300 shadow-lg ${
                          isUploading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-gray-800 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5"
                        }`}
                      >
                        <FiUpload className="mr-2 h-4 w-4" />
                        Upload Book File
                        <input
                          type="file"
                          accept=".pdf,.epub,.doc,.docx"
                          onChange={handleBookFileChange}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}

                    <p className="text-xs text-gray-600 mt-3">
                      Supports: PDF, EPUB, DOC, DOCX
                      <br />
                      Max size: 100MB • Stored in Cloudinary
                    </p>
                  </div>
                </div>

                {/* Basic Info Fields */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <FiBook className="mr-2 h-4 w-4 text-green-500" />
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                        errors.title
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter book title"
                      disabled={isUploading}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.title}
                      </p>
                    )}
                  </div>
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
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                        errors.author
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter author name"
                      disabled={isUploading}
                    />
                    {errors.author && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.author}
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 hover:border-gray-300"
                      placeholder="Enter book description"
                      disabled={isUploading}
                    />
                  </div>
                  {/* ISBN Field */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <FiHash className="mr-2 h-4 w-4 text-green-500" />
                      ISBN Number
                      <span className="text-xs text-gray-500 ml-2">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 hover:border-gray-300"
                      placeholder="e.g., 978-0-123456-47-2"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      International Standard Book Number (optional)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Other form fields remain the same but with updated colors */}
              <div className="space-y-6">
                {/* Category Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiTag className="mr-2 h-4 w-4 text-green-500" />
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 appearance-none bg-white ${
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
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Dewey Decimal Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiList className="mr-2 h-4 w-4 text-green-500" />
                    Dewey Decimal *
                  </label>
                  <input
                    type="text"
                    name="dewey_number"
                    value={formData.dewey_number}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                      errors.dewey_number
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g., 813.54, 920, 500-599"
                    disabled={isUploading}
                  />
                  {formData.category && deweySuggestions[formData.category] && (
                    <p className="text-xs text-gray-600 mt-2">
                      Suggested for {formData.category}:{" "}
                      {deweySuggestions[formData.category]}
                    </p>
                  )}
                  {errors.dewey_number && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.dewey_number}
                    </p>
                  )}
                </div>

                {/* Price Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiDollarSign className="mr-2 h-4 w-4 text-green-500" />
                    Price ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                        errors.price
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="0.00"
                      disabled={isUploading}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Published Date Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiCalendar className="mr-2 h-4 w-4 text-green-500" />
                    Published Date *
                  </label>
                  <input
                    type="date"
                    name="published_date"
                    value={formData.published_date}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                      errors.published_date
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    disabled={isUploading}
                  />
                  {errors.published_date && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.published_date}
                    </p>
                  )}
                </div>

                {/* Publisher Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Publisher
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter publisher name"
                    disabled={isUploading}
                  />
                </div>

                {/* Language Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
                    disabled={isUploading}
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pages Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Optional"
                    disabled={isUploading}
                  />
                </div>

                {/* Total Copies Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    name="total_copies"
                    value={formData.total_copies}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                      errors.total_copies
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    disabled={isUploading}
                  />
                  {errors.total_copies && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.total_copies}
                    </p>
                  )}
                </div>

                {/* Format Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Format
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
                    disabled={isUploading}
                  >
                    <option value="physical">Physical</option>
                    <option value="digital">Digital</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Status Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
                    disabled={isUploading}
                  >
                    <option value="available">📗 Available</option>
                    <option value="unavailable">📕 Unavailable</option>
                  </select>
                </div>

                {/* Featured Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      disabled={isUploading}
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-800">
                      Featured Book
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Featured books will be highlighted on the homepage
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Progress Indicator */}
            {(isUploading || uploadProgress > 0) && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">
                    Uploading Files...
                  </span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-gray-700 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
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
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm flex items-center">
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
                {book ? "Update Book" : "Add Book"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookFormModal;
