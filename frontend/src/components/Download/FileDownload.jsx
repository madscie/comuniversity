import React, { useState, useEffect } from 'react';
import { FiDownload, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const FileDownload = ({ downloadData, bookTitle, format, onDownloadComplete, onBack }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('preparing'); // preparing → downloading → complete → error
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-start download after a brief delay
    const timer = setTimeout(() => {
      startDownload();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const simulateDownload = () => {
    return new Promise((resolve, reject) => {
      let currentProgress = 0;
      
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Simulate occasional errors
          if (Math.random() < 0.1) { // 10% chance of error for demo
            setTimeout(() => {
              reject(new Error('Network error occurred during download'));
            }, 500);
          } else {
            setTimeout(() => {
              resolve();
            }, 500);
          }
        }
        
        setProgress(Math.min(currentProgress, 100));
      }, 200);
    });
  };

  const startDownload = async () => {
    setStatus('downloading');
    setError('');
    
    try {
      await simulateDownload();
      
      // Create and trigger actual file download
      await triggerFileDownload();
      
      setStatus('complete');
      
      // Notify parent after a delay
      setTimeout(() => {
        onDownloadComplete();
      }, 1500);
      
    } catch (err) {
      setStatus('error');
      setError(err.message);
      console.error('Download failed:', err);
    }
  };

  const triggerFileDownload = () => {
    return new Promise((resolve) => {
      // Create a mock file content based on book title and format
      const content = `This is a mock download of "${bookTitle}" in ${format} format.\n\nThank you for your purchase!\n\n---\nCommuniversity Library`;
      
      const blob = new Blob([content], { type: getMimeType(format) });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.style.display = 'none';
      a.href = url;
      a.download = `${bookTitle.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      resolve();
    });
  };

  const getMimeType = (format) => {
    const mimeTypes = {
      'PDF': 'application/pdf',
      'EPUB': 'application/epub+zip',
      'MOBI': 'application/x-mobipocket-ebook'
    };
    return mimeTypes[format] || 'application/octet-stream';
  };

  const retryDownload = () => {
    setProgress(0);
    setStatus('downloading');
    setError('');
    startDownload();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'preparing':
        return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>;
      case 'downloading':
        return <FiDownload className="w-8 h-8 text-blue-600 animate-bounce" />;
      case 'complete':
        return <FiCheck className="w-8 h-8 text-green-600" />;
      case 'error':
        return <FiAlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <FiDownload className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing your download...';
      case 'downloading':
        return 'Downloading your book...';
      case 'complete':
        return 'Download complete!';
      case 'error':
        return 'Download failed';
      default:
        return 'Starting download...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'preparing':
        return 'Getting everything ready for your download';
      case 'downloading':
        return `Your book is being downloaded in ${format} format`;
      case 'complete':
        return `"${bookTitle}" has been successfully downloaded`;
      case 'error':
        return error || 'An error occurred during download';
      default:
        return 'Starting the download process';
    }
  };

  return (
    <div className="w-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          {getStatusIcon()}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {getStatusText()}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {getStatusDescription()}
        </p>

        {/* Progress Bar */}
        {(status === 'preparing' || status === 'downloading') && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{Math.round(progress)}% Complete</p>
          </div>
        )}

        {/* Download Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-gray-900 mb-2">Download Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>File:</span>
              <span className="font-medium">{bookTitle}.{format.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="font-medium">{format}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${
                status === 'complete' ? 'text-green-600' :
                status === 'error' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {status === 'error' ? (
            <>
              <button
                onClick={onBack}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <FiArrowLeft className="mr-2 w-4 h-4" />
                Back
              </button>
              <button
                onClick={retryDownload}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <FiDownload className="mr-2 w-4 h-4" />
                Retry Download
              </button>
            </>
          ) : status !== 'complete' ? (
            <button
              onClick={onBack}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2 w-4 h-4" />
              Back to Payment
            </button>
          ) : (
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Your download has started automatically. Check your downloads folder.
              </p>
            </div>
          )}
        </div>

        {/* Download Tips */}
        {status === 'downloading' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Download Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Don't close this window during download</li>
              <li>• File will be saved to your default downloads folder</li>
              <li>• You can download again within 24 hours if needed</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDownload;