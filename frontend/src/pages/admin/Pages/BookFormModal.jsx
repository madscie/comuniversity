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
  FiDownload,
  FiTrash2,
  FiDollarSign,
  FiList
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

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
    featured: false
  });
  
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    "Children's History & Geography"
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
    "Other"
  ];

  // Dewey Decimal suggestions by category
  const deweySuggestions = {
    "General Works": "000-099",
    "Philosophy & Psychology": "100-199",
    "Religion": "200-299",
    "Social Sciences": "300-399",
    "Language": "400-499",
    "Natural Sciences & Math": "500-599",
    "Technology & Applied Sciences": "600-699",
    "Arts & Recreation": "700-799",
    "Literature": "800-899",
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
    "Children's History & Geography": "J 900-999"
  };

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        category: book.category || "",
        dewey_number: book.dewey_number || "",
        price: book.price ? book.price.toString() : "0.00",
        published_date: book.published_date || new Date().getFullYear() + "-01-01",
        total_copies: book.total_copies || 1,
        description: book.description || "",
        publisher: book.publisher || "",
        language: book.language || "English",
        pages: book.pages || "",
        status: book.status || "available",
        format: book.format || "physical",
        featured: book.featured || false
      });
      if (book.cover_image) {
        setCoverPreview(book.cover_image);
      }
    } else {
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
        featured: false
      });
      setCoverImage(null);
      setCoverPreview("");
    }
    setErrors({});
  }, [book, isOpen]);

  // Auto-suggest Dewey Decimal when category changes
  useEffect(() => {
    if (formData.category && !formData.dewey_number && deweySuggestions[formData.category]) {
      setFormData(prev => ({
        ...prev,
        dewey_number: deweySuggestions[formData.category]
      }));
    }
  }, [formData.category]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'price') {
      // Format price input
      const formattedValue = value.replace(/[^\d.]/g, '');
      const parts = formattedValue.split('.');
      if (parts.length > 2) return;
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          coverImage: "Please select a valid image file (JPEG, PNG, GIF, WebP)"
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          coverImage: "Image size should be less than 5MB"
        }));
        return;
      }

      setCoverImage(file);
      setErrors(prev => ({ ...prev, coverImage: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview("");
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

    if (!formData.dewey_number.trim()) {
      newErrors.dewey_number = "Dewey Decimal classification is required";
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.published_date) {
      newErrors.published_date = "Published date is required";
    }

    if (!formData.total_copies || formData.total_copies < 1) {
      newErrors.total_copies = "Must have at least 1 copy";
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
        price: parseFloat(formData.price) || 0,
        total_copies: parseInt(formData.total_copies),
        pages: formData.pages ? parseInt(formData.pages) : null,
        featured: formData.featured ? 1 : 0
      };

      if (coverImage) {
        submissionData.coverImageFile = coverImage;
      }

      await onSave(submissionData, book?.id);
      onClose();
    } catch (error) {
      console.error("Error saving book:", error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || "Failed to save book. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <FiBook className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {book ? "Edit Book" : "Add New Book"}
                </h2>
                <p className="text-blue-100 opacity-90 text-sm">
                  {book ? "Update book information" : "Add a new book to the library"}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Cover Image Upload */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <FiImage className="mr-2 h-4 w-4 text-blue-500" />
                    Cover Image
                    <span className="text-xs text-gray-500 ml-2 font-normal">(Optional)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0 h-40 w-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 hover:border-blue-400 hover:shadow-md">
                      {coverPreview ? (
                        <div className="relative h-full w-full group">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={removeCoverImage}
                              className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">No cover</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        <FiUpload className="mr-2 h-4 w-4" />
                        Upload Cover
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-600 mt-3">
                        Supports: JPEG, PNG, GIF, WebP<br />
                        Max size: 5MB
                      </p>
                    </div>
                  </div>
                  {errors.coverImage && (
                    <p className="text-red-500 text-sm mt-3 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.coverImage}
                    </p>
                  )}
                </div>

                {/* Title Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiBook className="mr-2 h-4 w-4 text-blue-500" />
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
                    placeholder="Enter book title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <FiX className="mr-1 h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
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

                {/* ISBN Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiHash className="mr-2 h-4 w-4 text-purple-500" />
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter ISBN (optional)"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
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

                {/* Dewey Decimal Field */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FiList className="mr-2 h-4 w-4 text-indigo-500" />
                    Dewey Decimal *
                  </label>
                  <input
                    type="text"
                    name="dewey_number"
                    value={formData.dewey_number}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.dewey_number 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g., 813.54, 920, 500-599"
                  />
                  {formData.category && deweySuggestions[formData.category] && (
                    <p className="text-xs text-gray-600 mt-2">
                      Suggested for {formData.category}: {deweySuggestions[formData.category]}
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
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                        errors.price 
                          ? "border-red-300 bg-red-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="0.00"
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
                    <FiCalendar className="mr-2 h-4 w-4 text-red-500" />
                    Published Date *
                  </label>
                  <input
                    type="date"
                    name="published_date"
                    value={formData.published_date}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.published_date 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter publisher name"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    placeholder="Optional"
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
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      errors.total_copies 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300"
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

            {/* Description Field */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 resize-none hover:border-gray-300"
                placeholder="Enter book description (optional)"
              />
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
                Fields marked with * are required
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
                      {book ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    book ? "Update Book" : "Add Book"
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

export default BookFormModal;