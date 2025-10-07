import React, { useState } from 'react';
import { bookAPI } from '../../services/api';

const AdvancedSearchModal = ({ isOpen, onClose, onSearchResults }) => {
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    language: '',
    year_from: '',
    year_to: '',
    available_only: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Science' },
    { id: 4, name: 'Technology' },
    { id: 5, name: 'History' },
    { id: 6, name: 'Art' },
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Other'];

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const results = await bookAPI.advancedSearch(filters);
      onSearchResults(results);
      onClose();
    } catch (error) {
      console.error('Advanced search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      q: '',
      category: '',
      language: '',
      year_from: '',
      year_to: '',
      available_only: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Keyword Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                placeholder="Search by title, author, ISBN, or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Year Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published From Year
                </label>
                <input
                  type="number"
                  value={filters.year_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, year_from: e.target.value }))}
                  placeholder="1900"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published To Year
                </label>
                <input
                  type="number"
                  value={filters.year_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, year_to: e.target.value }))}
                  placeholder={new Date().getFullYear()}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available_only"
                checked={filters.available_only}
                onChange={(e) => setFilters(prev => ({ ...prev, available_only: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="available_only" className="ml-2 block text-sm text-gray-900">
                Show only available books
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Reset Filters
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;