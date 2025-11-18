import { useState } from "react";
import { FiUpload, FiFile, FiImage, FiX, FiTrash2 } from "react-icons/fi";

const FileUpload = ({
  label,
  accept,
  file = null,
  preview = "",
  onFileChange,
  onRemove,
  maxSize,
  allowedTypes = [],
  helpText = "",
  required = false,
  type = "image", // 'image' or 'file'
  disabled = false,
  error = ""
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      toast.error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    onFileChange(file);
  };

  const renderPreview = () => {
    if (type === "image") {
      return (
        <div className="relative w-32 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {preview ? (
            <div className="relative w-full h-full group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
              <div className="image-fallback absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <FiImage className="h-8 w-8 text-gray-400" />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onRemove}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300"
                  disabled={disabled}
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <FiImage className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">No {label.toLowerCase()}</p>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
          <FiFile className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          {file ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiFile className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                disabled={disabled}
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-3">No file selected</p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
        {type === "image" ? <FiImage className="mr-2 h-4 w-4 text-green-500" /> : <FiFile className="mr-2 h-4 w-4 text-green-500" />}
        {label}
        {required && <span className="text-xs text-red-500 ml-2">*</span>}
        {!required && <span className="text-xs text-gray-500 ml-2">(Optional)</span>}
      </label>

      <div className="flex flex-col items-center space-y-4">
        {renderPreview()}

        <label
          className={`cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-green-600 text-white rounded-lg transition-all duration-300 shadow-lg ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : dragOver
              ? "from-gray-800 to-green-700 shadow-xl -translate-y-0.5"
              : "hover:from-gray-800 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FiUpload className="mr-2 h-4 w-4" />
          {file ? `Change ${label}` : `Upload ${label}`}
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
            required={required && !file && !preview}
          />
        </label>

        {helpText && (
          <p className="text-xs text-gray-600 text-center">{helpText}</p>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;