import React, { useState } from 'react';

const BookReaderModal = ({ isOpen, onClose, book, bookFileUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (bookFileUrl) {
      const link = document.createElement('a');
      link.href = bookFileUrl;
      link.download = `${book.title || 'book'}.pdf`;
      link.click();
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3002${imagePath}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{book.title || 'Untitled'}</h2>
            <p className="text-gray-600">by {book.author || 'Unknown Author'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Book Cover and Info */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
              {book.cover_image ? (
                <img
                  src={getImageUrl(book.cover_image)}
                  alt={book.title}
                  className="w-48 h-64 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Cover</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">ISBN</h3>
                  <p className="text-gray-900">{book.isbn || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Publisher</h3>
                  <p className="text-gray-900">{book.publisher || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Published Year</h3>
                  <p className="text-gray-900">{book.published_year || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Language</h3>
                  <p className="text-gray-900">{book.language || 'English'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-900 mt-1">{book.description || 'No description available.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-700 mb-4">Book Content</h3>
            
            {bookFileUrl ? (
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                  <span className="font-medium">PDF Viewer</span>
                  <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                </div>
                <div className="h-96">
                  <iframe
                    src={bookFileUrl}
                    className="w-full h-full"
                    title={`${book.title} - PDF Viewer`}
                    onLoad={() => setIsLoading(false)}
                  />
                  {isLoading && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-600">Loading PDF...</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">No book file available for reading.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          {bookFileUrl && (
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookReaderModal;