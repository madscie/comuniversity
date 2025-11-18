import { useState, useEffect } from "react";
import {
  FiX,
  FiBook,
  FiUser,
  FiHash,
  FiTag,
  FiCalendar,
  FiDollarSign,
  FiList,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import FormField from "../../../components/UI/FormField";
import FileUpload from "../../../components/UI/FileUpload";
import {
  validateISBN,
  validateDeweyDecimal,
  getImageUrl,
} from "../../../utils/helpers";

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
    if (book && isOpen) {
      console.log("📖 Editing book:", book);

      // FIX: Ensure published_date is in correct format for date input
      let publishedDate = book.published_date;
      if (publishedDate && publishedDate.includes("T")) {
        publishedDate = publishedDate.split("T")[0]; // Extract just the date part
      }

      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        category: book.category || "",
        dewey_number: book.dewey_number || "",
        price: book.price ? parseFloat(book.price).toString() : "0.00",
        published_date: publishedDate || new Date().getFullYear() + "-01-01",
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

      // Set cover preview if cover_image exists
      if (book.cover_image) {
        const imageUrl = getImageUrl(book.cover_image);
        setCoverPreview(imageUrl);
      } else {
        setCoverPreview("");
      }

      setCoverImage(null);
      setBookFile(null);
    } else if (isOpen) {
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
      // Enhanced price validation
      const formattedValue = value
        .replace(/[^\d.]/g, "")
        .replace(/(\..*)\./g, "$1"); // Remove extra decimal points

      const decimalParts = formattedValue.split(".");
      if (decimalParts[1] && decimalParts[1].length > 2) {
        return; // Limit to 2 decimal places
      }

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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCoverImageChange = (file) => {
    setCoverImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    toast.info("Cover image selected. Click save to upload.");
  };

  const handleBookFileChange = (file) => {
    setBookFile(file);
    toast.info("Book file selected. Click save to upload.");
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview("");
    toast.info("Cover image removed");
  };

  const removeBookFile = () => {
    setBookFile(null);
    toast.info("Book file removed");
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation with clear messages
    if (!formData.title.trim()) {
      newErrors.title =
        "📖 Book title is required - please enter the book title";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "📖 Book title must be at least 2 characters long";
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

    if (!formData.dewey_number.trim()) {
      newErrors.dewey_number =
        "🔢 Dewey Decimal classification is required - this helps organize books in the library";
    } else if (!validateDeweyDecimal(formData.dewey_number)) {
      newErrors.dewey_number =
        "🔢 Please enter a valid Dewey Decimal format (e.g., 813.54, 500-599, J 920)";
    }

    // Price validation
    const price = parseFloat(formData.price);
    if (isNaN(price)) {
      newErrors.price = "💵 Price must be a valid number (e.g., 19.99)";
    } else if (price < 0) {
      newErrors.price =
        "💵 Price cannot be negative - please enter 0 or higher";
    } else if (price > 10000) {
      newErrors.price = "💵 Price seems too high - maximum allowed is $10,000";
    }

    // Date validation
    if (!formData.published_date) {
      newErrors.published_date =
        "📅 Published date is required - please select when the book was published";
    } else {
      const publishedDate = new Date(formData.published_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (publishedDate > today) {
        newErrors.published_date =
          "📅 Published date cannot be in the future - please select a past or current date";
      } else if (publishedDate.getFullYear() < 1000) {
        newErrors.published_date =
          "📅 Please enter a valid year (after 1000 AD)";
      }
    }

    // Copies validation
    if (!formData.total_copies) {
      newErrors.total_copies =
        "📚 Number of copies is required - please enter how many copies you have";
    } else if (formData.total_copies < 1) {
      newErrors.total_copies =
        "📚 Must have at least 1 copy - please enter 1 or more";
    } else if (formData.total_copies > 1000) {
      newErrors.total_copies =
        "📚 Maximum 1000 copies allowed - please enter a smaller quantity";
    } else if (!Number.isInteger(Number(formData.total_copies))) {
      newErrors.total_copies =
        "📚 Number of copies must be a whole number (no decimals)";
    }

    // ISBN validation
    if (formData.isbn.trim() && !validateISBN(formData.isbn)) {
      newErrors.isbn =
        "🔤 ISBN must be exactly 10 or 13 digits (numbers only). You entered: " +
        formData.isbn.replace(/[-\s]/g, "").length +
        " digits. " +
        "Format examples: 1234567890 or 1234567890123";
    }

    // Pages validation
    if (formData.pages) {
      const pages = parseInt(formData.pages);
      if (isNaN(pages) || pages < 1) {
        newErrors.pages =
          "📄 Number of pages must be a positive whole number (1 or more)";
      } else if (pages > 10000) {
        newErrors.pages =
          "📄 Maximum 10,000 pages allowed - please verify the page count";
      } else if (!Number.isInteger(pages)) {
        newErrors.pages = "📄 Page count must be a whole number (no decimals)";
      }
    }

    // File validations
    if (!book?.cover_image && !coverPreview && !coverImage) {
      newErrors.coverImage =
        "🖼️ Book cover image is required - please upload a cover image";
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

    // Prepare data - only include changed fields for editing
    // FIX: Convert published_date to simple YYYY-MM-DD format
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
      // FIX: Convert to simple date format without timezone
      published_date: formData.published_date.split("T")[0], // This extracts just YYYY-MM-DD
      language: formData.language,
      status: formData.status,
      total_copies: parseInt(formData.total_copies) || 1,
      featured: formData.featured ? 1 : 0,
    };

    console.log("📤 Starting book save...", submissionData);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Add files to submission data if they exist
      if (coverImage) {
        submissionData.coverImage = coverImage;
      }

      if (bookFile) {
        submissionData.bookFile = bookFile;
      }

      // Simulate upload progress
      setUploadProgress(30);

      // Call the save function
      await onSave(submissionData, book?.id);

      setUploadProgress(100);
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
                    ? "Update book information - only changed fields will be updated"
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
                <FileUpload
                  label="Cover Image"
                  type="image"
                  accept="image/*"
                  file={coverImage}
                  preview={coverPreview}
                  onFileChange={handleCoverImageChange}
                  onRemove={removeCoverImage}
                  maxSize={5 * 1024 * 1024}
                  allowedTypes={[
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                  ]}
                  helpText="Supports: JPEG, PNG, GIF, WebP • Max size: 5MB • Stored in Cloudinary"
                  required={!book?.cover_image && !coverPreview}
                  disabled={isUploading}
                  error={errors.coverImage}
                />

                {/* Book File Upload */}
                <FileUpload
                  label="Book File"
                  type="file"
                  accept=".pdf,.epub,.doc,.docx"
                  file={bookFile}
                  onFileChange={handleBookFileChange}
                  onRemove={removeBookFile}
                  maxSize={100 * 1024 * 1024}
                  allowedTypes={[
                    "application/pdf",
                    "application/epub+zip",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ]}
                  helpText="Supports: PDF, EPUB, DOC, DOCX • Max size: 100MB • Stored in Cloudinary"
                  required={false}
                  disabled={isUploading}
                  error={errors.bookFile}
                />

                {/* Basic Info Fields */}
                <div className="space-y-4">
                  <FormField
                    label="Title"
                    icon={FiBook}
                    error={errors.title}
                    required={true}
                  >
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
                  </FormField>

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
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                        errors.author
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter author name"
                      disabled={isUploading}
                      required={true}
                    />
                  </FormField>

                  <FormField
                    label="Description"
                    helpText="Provide a brief description of the book"
                  >
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 hover:border-gray-300"
                      placeholder="Enter book description"
                      disabled={isUploading}
                      required={true}
                    />
                  </FormField>

                  <FormField
                    label="ISBN Number"
                    icon={FiHash}
                    error={errors.isbn}
                    helpText="International Standard Book Number (10 or 13 digits, optional)"
                  >
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                        errors.isbn
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="e.g., 978-0-123456-47-2"
                      disabled={isUploading}
                      required={true}
                    />
                  </FormField>
                </div>
              </div>

              {/* Right Column - Other Fields */}
              <div className="space-y-6">
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
                </FormField>

                <FormField
                  label="Dewey Decimal"
                  icon={FiList}
                  error={errors.dewey_number}
                  required
                  helpText={
                    formData.category && deweySuggestions[formData.category]
                      ? `Suggested for ${formData.category}: ${
                          deweySuggestions[formData.category]
                        }`
                      : "Enter Dewey Decimal classification (e.g., 813.54, 920, 500-599)"
                  }
                >
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
                    required={true}
                  />
                </FormField>

                <FormField
                  label="Price ($)"
                  icon={FiDollarSign}
                  error={errors.price}
                  required={true}
                >
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
                </FormField>

                <FormField
                  label="Published Date"
                  icon={FiCalendar}
                  error={errors.published_date}
                  required={true}
                >
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
                </FormField>

                <FormField
                  label="Publisher"
                  helpText="Name of the publishing company"
                  required={true}
                >
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter publisher name"
                    disabled={isUploading}
                  />
                </FormField>

                <FormField label="Language">
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
                </FormField>

                <FormField
                  label="Number of Pages"
                  error={errors.pages}
                  helpText="Total number of pages (optional)"
                >
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                      errors.pages
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Optional"
                    disabled={isUploading}
                  />
                </FormField>

                <FormField
                  label="Total Copies"
                  error={errors.total_copies}
                  required={true}
                >
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
                </FormField>

                <FormField label="Format">
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
                </FormField>

                <FormField label="Status">
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
                </FormField>

                <FormField label="" className="!p-4">
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
                    className="bg-gradient-to-r from-gray-700 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Please don't close this window while files are uploading...
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
