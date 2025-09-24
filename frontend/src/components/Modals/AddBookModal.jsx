import React, { useState } from 'react';
import { bookAPI } from '../../services/api';

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
  const [contentType, setContentType] = useState('book');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    description: '',
    total_copies: 1,
    available_copies: 1,
    cover_image: null,
    content_file: null,
    publisher: '',
    published_year: new Date().getFullYear(),
    language: 'English',
    tags: '',
    dewey_decimal: '',
    // Article-specific fields
    journal_name: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    // Children's section specific
    age_group: '',
    reading_level: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const contentTypes = [
    { value: 'book', label: 'Book' },
    { value: 'article', label: 'Article' },
    { value: 'journal', label: 'Journal' },
    { value: 'children', label: "Children's Section" },
    { value: 'thesis', label: 'Thesis/Dissertation' },
    { value: 'report', label: 'Report' }
  ];

  const categories = [
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Science' },
    { id: 4, name: 'Technology' },
    { id: 5, name: 'History' },
    { id: 6, name: 'Art' },
    { id: 7, name: 'Business' },
    { id: 8, name: 'Education' },
    { id: 9, name: 'Literature' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.dewey_decimal.trim()) newErrors.dewey_decimal = 'Dewey Decimal is required';
    
    if (contentType === 'book' && !formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required for books';
    }
    
    if (formData.total_copies < 1) newErrors.total_copies = 'Must have at least 1 copy';
    if (formData.available_copies < 0) newErrors.available_copies = 'Available copies cannot be negative';
    if (formData.available_copies > formData.total_copies) {
      newErrors.available_copies = 'Available copies cannot exceed total copies';
    }
    
    if (!formData.content_file) {
      newErrors.content_file = 'Content file is required';
    } else if (formData.content_file.size > 50 * 1024 * 1024) {
      newErrors.content_file = 'File size must be less than 50MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      console.log('Starting book upload...');
      console.log('Form data:', formData);
      
      // Use the bookAPI directly with the formData object
      const newBook = await bookAPI.create(formData);
      onBookAdded(newBook);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error adding book:', error);
      alert(error.message || 'Failed to add book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'cover_image' || name === 'content_file') {
      const file = files[0];
      if (file) {
        let maxSize = name === 'cover_image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
        
        if (file.size > maxSize) {
          setErrors(prev => ({ 
            ...prev, 
            [name]: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
          }));
          return;
        }
        
        if (name === 'cover_image' && !file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, [name]: 'Only image files are allowed' }));
          return;
        }
        
        if (name === 'content_file') {
          const allowedTypes = ['application/pdf', 'application/epub+zip', 
                               'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
          if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, [name]: 'Only PDF, EPUB, DOC, and DOCX files are allowed' }));
            return;
          }
        }

        setFormData(prev => ({ ...prev, [name]: file }));
        setErrors(prev => ({ ...prev, [name]: null }));
        
        if (name === 'cover_image') {
          const reader = new FileReader();
          reader.onload = (e) => setImagePreview(e.target.result);
          reader.readAsDataURL(file);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setContentType(newType);
    setFormData(prev => ({
      ...prev,
      journal_name: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      age_group: '',
      reading_level: ''
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category_id: '',
      description: '',
      total_copies: 1,
      available_copies: 1,
      cover_image: null,
      content_file: null,
      publisher: '',
      published_year: new Date().getFullYear(),
      language: 'English',
      tags: '',
      dewey_decimal: '',
      journal_name: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      age_group: '',
      reading_level: ''
    });
    setImagePreview(null);
    setErrors({});
    setContentType('book');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Content</h2>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type *</label>
              <select
                value={contentType}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter content title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  value={formData.author}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter author name"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>

              {/* ISBN (only for books) */}
              {contentType === 'book' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                  <input
                    type="text"
                    name="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.isbn ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter ISBN number"
                  />
                  {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
                </div>
              )}

              {/* Dewey Decimal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dewey Decimal *</label>
                <input
                  type="text"
                  name="dewey_decimal"
                  required
                  value={formData.dewey_decimal}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dewey_decimal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Dewey Decimal code"
                />
                {errors.dewey_decimal && <p className="text-red-500 text-sm mt-1">{errors.dewey_decimal}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
              </div>

              {/* Article-specific fields */}
              {(contentType === 'article' || contentType === 'journal') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Journal Name</label>
                    <input
                      type="text"
                      name="journal_name"
                      value={formData.journal_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter journal name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                    <input
                      type="text"
                      name="volume"
                      value={formData.volume}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter volume"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                    <input
                      type="text"
                      name="issue"
                      value={formData.issue}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter issue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                    <input
                      type="text"
                      name="pages"
                      value={formData.pages}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 123-145"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                    <input
                      type="text"
                      name="doi"
                      value={formData.doi}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter DOI"
                    />
                  </div>
                </>
              )}

              {/* Children's section specific fields */}
              {contentType === 'children' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <select
                      name="age_group"
                      value={formData.age_group}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Age Group</option>
                      <option value="0-3">0-3 years</option>
                      <option value="4-6">4-6 years</option>
                      <option value="7-9">7-9 years</option>
                      <option value="10-12">10-12 years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reading Level</label>
                    <select
                      name="reading_level"
                      value={formData.reading_level}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Reading Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </>
              )}

              {/* Common fields for all content types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter publisher name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Published Year</label>
                <input
                  type="number"
                  name="published_year"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.published_year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Total Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                <input
                  type="number"
                  name="total_copies"
                  min="1"
                  value={formData.total_copies}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.total_copies ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.total_copies && <p className="text-red-500 text-sm mt-1">{errors.total_copies}</p>}
              </div>

              {/* Available Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies</label>
                <input
                  type="number"
                  name="available_copies"
                  min="0"
                  max={formData.total_copies}
                  value={formData.available_copies}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.available_copies ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.available_copies && <p className="text-red-500 text-sm mt-1">{errors.available_copies}</p>}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tags separated by commas"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter content description"
              />
            </div>

            {/* Content File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content File *</label>
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  name="content_file"
                  accept=".pdf,.epub,.doc,.docx"
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                    errors.content_file ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.content_file && <p className="text-red-500 text-sm">{errors.content_file}</p>}
                {formData.content_file && (
                  <p className="text-sm text-gray-600">
                    Selected file: {formData.content_file.name} ({(formData.content_file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                    errors.cover_image ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cover_image && <p className="text-red-500 text-sm">{errors.cover_image}</p>}
                
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  `Add ${contentTypes.find(t => t.value === contentType)?.label}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;