import {
  FiDownload,
  FiHeart,
  FiShare2,
  FiStar,
  FiEye,
  FiBookOpen,
} from "react-icons/fi";
import { renderStars } from "../../utils/ratingHelper";
import { getImageUrl, handleImageError } from "../../utils/helpers";
import { componentClasses } from "../../components/UI/TailwindColors";

export const BookCard = ({
  book,
  onToggleFavorite,
  onDownload,
  onReadOnline,
  showProgress = false,
}) => {
  const safeBook = book || {};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <img
          src={getImageUrl(safeBook.cover_image)}
          alt={safeBook.title}
          className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onToggleFavorite?.(safeBook.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              safeBook.isFavorite
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white"
            }`}
          >
            <FiHeart
              className={`h-4 w-4 ${safeBook.isFavorite ? "fill-current" : ""}`}
            />
          </button>
          <button className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white transition-all duration-200 shadow-lg">
            <FiShare2 className="h-4 w-4" />
          </button>
        </div>
        {showProgress && safeBook.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 dark:bg-gray-900/90 text-white p-2 backdrop-blur-sm">
            <div className="w-full bg-gray-600 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${safeBook.progress}%` }}
              ></div>
            </div>
            <div className="text-xs mt-1 flex justify-between items-center">
              <span>Reading progress</span>
              <span className="font-semibold">{safeBook.progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight mb-1 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
              {safeBook.title || "Untitled"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
              By {safeBook.author || "Unknown Author"}
            </p>
          </div>
          <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-500 ml-2 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
            <FiStar className="fill-current mr-1" />
            {safeBook.rating || "0.0"}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {safeBook.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
          {safeBook.tags?.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
              +{safeBook.tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center">
            <FiBookOpen className="mr-1" />
            {safeBook.format || "PDF"}
          </span>
          <span>{safeBook.file_size || "N/A"}</span>
          <span>{safeBook.pages || "N/A"} pages</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onDownload?.(safeBook.id, "PDF")}
            className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${componentClasses.btn.primary}`}
          >
            <FiDownload className="mr-1" /> Download
          </button>
          <button
            onClick={() => onReadOnline?.(safeBook.id)}
            className={`p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 ${componentClasses.btn.ghost}`}
          >
            <FiEye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
