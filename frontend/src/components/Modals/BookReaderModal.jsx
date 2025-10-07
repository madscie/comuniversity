import React, { useState, useRef } from 'react';

const BookReaderModal = ({ isOpen, onClose, book, bookFileUrl }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.25));
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg ${isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full max-h-[90vh]'} overflow-hidden`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">{book.title || 'Untitled'}</h2>
            <span className="text-sm text-gray-600">by {book.author || 'Unknown Author'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Reading Controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Zoom Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Zoom In"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            <button
              onClick={handleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-8rem)]">
          {/* Book Info Sidebar */}
          <div className="w-80 border-r p-4 overflow-y-auto">
            <div className="mb-4">
              {book.cover_image ? (
                <img
                  src={getImageUrl(book.cover_image)}
                  alt={book.title}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Cover</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
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
              
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-900 text-sm mt-1">{book.description || 'No description available.'}</p>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 flex flex-col">
            {bookFileUrl ? (
              <>
                <div className="flex-1 relative">
                  <iframe
                    ref={iframeRef}
                    src={`${bookFileUrl}#view=fitH&zoom=${zoomLevel * 100}`}
                    className="w-full h-full"
                    title={`${book.title} - PDF Viewer`}
                  />
                </div>
                
                {/* Navigation Controls */}
                <div className="border-t px-4 py-2 bg-gray-50 flex justify-between items-center">
                  <button
                    onClick={handlePreviousPage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Previous Page
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next Page
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No book file available for reading.</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {book.available_copies || 0} copies available
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            
            {bookFileUrl && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReaderModal;