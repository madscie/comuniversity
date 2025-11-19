// components/DocumentViewer.jsx
import { FiDownload, FiExternalLink, FiFile } from "react-icons/fi";
import Button from "../components/UI/Button";
import {
  getFileIcon,
  getFileTypeName,
  formatFileSize,
  handleDownload,
  handleViewDocument,
} from "../utils/fileHelpers";

const DocumentViewer = ({
  document,
  loading = false,
  title = "Document",
  description = "This article includes a downloadable document",
}) => {
  if (!document?.file_url) return null;

  const handleDownloadClick = async () => {
    await handleDownload(document.file_url, document.file_name || "document");
  };

  const handleViewClick = () => {
    handleViewDocument(document.file_url);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{getFileIcon(document.file_type)}</div>
          <div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-1">
              {title}
            </h3>
            <p className="text-green-700 dark:text-green-400 mb-2">
              {description} - {getFileTypeName(document.file_type)}
              {document.file_size && ` (${formatFileSize(document.file_size)})`}
            </p>
            <p className="text-green-600 dark:text-green-500 text-sm">
              File: {document.file_name || "document"}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            onClick={handleViewClick}
            className="flex items-center whitespace-nowrap"
            disabled={loading}
          >
            <FiExternalLink className="mr-2" />
            {loading ? "Opening..." : "View Document"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadClick}
            className="flex items-center whitespace-nowrap border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            disabled={loading}
          >
            <FiDownload className="mr-2" />
            {loading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
