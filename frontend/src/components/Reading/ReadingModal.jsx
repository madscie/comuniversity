import { useState, useEffect } from "react";
import {
  FiX,
  FiMenu,
  FiSettings,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiTarget,
  FiZoomIn,
  FiZoomOut,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import Button from "../UI/Button";
import { readingService } from "../../services/readingService";
import { formatReadingTime } from "../../utils/dateHelper";

const ReadingModal = ({
  book,
  chapters,
  isOpen,
  onClose,
  currentChapter,
  currentPage,
  onChapterChange,
  onPageChange,
  readingTime,
  readingStats,
}) => {
  const [showChapters, setShowChapters] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light");
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (book && isOpen) {
      setBookmarks(readingService.getBookmarks(book.id));
    }
  }, [book, isOpen]);

  if (!isOpen || !book) return null;

  const currentChapterData = chapters[currentChapter];
  const currentPageContent = currentChapterData?.pages[currentPage];
  const totalChapters = chapters.length;
  const totalPagesInChapter = currentChapterData?.pages.length || 0;

  const calculateChapterProgress = (chapterIndex) => {
    const progress = readingService.getReadingProgress(book.id);
    return readingService.calculateChapterProgress(
      chapterIndex,
      chapters,
      progress
    );
  };

  const toggleBookmark = () => {
    if (!book) return;
    const newBookmarks = readingService.toggleBookmark(
      book.id,
      currentChapter,
      currentPage
    );
    setBookmarks(newBookmarks);
  };

  const isBookmarked = bookmarks.includes(`${currentChapter}-${currentPage}`);

  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    } else if (currentChapter > 0) {
      onChapterChange(currentChapter - 1);
      onPageChange(chapters[currentChapter - 1].pages.length - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPagesInChapter - 1) {
      onPageChange(currentPage + 1);
    } else if (currentChapter < totalChapters - 1) {
      onChapterChange(currentChapter + 1);
      onPageChange(0);
    }
  };

  const canGoPrevious = currentChapter > 0 || currentPage > 0;
  const canGoNext =
    currentChapter < totalChapters - 1 || currentPage < totalPagesInChapter - 1;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center"
          >
            <FiX className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {book.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {book.author}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Reading Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <FiClock className="mr-1 h-4 w-4" />
              {formatReadingTime(readingTime)}
            </div>
            <div className="flex items-center">
              <FiTarget className="mr-1 h-4 w-4" />
              {Math.round(calculateChapterProgress(currentChapter))}%
            </div>
          </div>

          {/* Control Buttons */}
          <Button
            variant="ghost"
            onClick={() => setShowChapters(!showChapters)}
            className="flex items-center"
          >
            <FiMenu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center"
          >
            <FiSettings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chapters Sidebar */}
        {showChapters && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiMenu className="mr-2 h-4 w-4" />
                Chapters
              </h3>
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentChapter === index
                        ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                    }`}
                    onClick={() => {
                      onChapterChange(index);
                      onPageChange(0);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start space-x-2">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            currentChapter === index
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white leading-tight">
                          {chapter.title}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                        {chapter.pages.length}p
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateChapterProgress(index)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                      <span>
                        {Math.round(calculateChapterProgress(index))}% complete
                      </span>
                      <span>
                        {(readingService.getReadingProgress(book.id)[index] ||
                          0) + 1}
                        /{chapter.pages.length} pages
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reading Area */}
        <div className="flex-1 flex flex-col">
          {/* Settings Panel */}
          {showSettings && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Font Size:
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                        disabled={fontSize <= 14}
                      >
                        <FiZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {fontSize}px
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                        disabled={fontSize >= 24}
                      >
                        <FiZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    className="flex items-center space-x-2"
                  >
                    {theme === "light" ? (
                      <FiMoon className="h-4 w-4" />
                    ) : (
                      <FiSun className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {theme === "light" ? "Dark" : "Light"} Mode
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reading Content */}
          <div
            className={`flex-1 overflow-y-auto p-8 ${
              theme === "dark" ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div className="max-w-4xl mx-auto">
              {currentPageContent && (
                <div
                  className={`prose max-w-none ${
                    theme === "dark" ? "prose-invert" : ""
                  }`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: "1.8",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {currentChapterData.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            Chapter {currentChapter + 1} of {chapters.length}
                          </span>
                          <span>•</span>
                          <span>
                            Page {currentPage + 1} of {totalPagesInChapter}
                          </span>
                          <span>•</span>
                          <span>
                            {Math.round(
                              calculateChapterProgress(currentChapter)
                            )}
                            % complete
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleBookmark}
                        className={
                          isBookmarked ? "text-green-500" : "text-gray-400"
                        }
                      >
                        <FiBookmark
                          className={`h-5 w-5 ${
                            isBookmarked ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`mb-8 p-8 rounded-xl ${
                      theme === "dark"
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Page {currentPage + 1}
                      </span>
                      {currentPage ===
                        (readingService.getReadingProgress(book.id)[
                          currentChapter
                        ] || 0) && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm">
                          <FiTarget className="mr-1 h-3 w-3" />
                          Last Read
                        </div>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {currentPageContent}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="flex items-center"
              >
                <FiChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Chapter {currentChapter + 1} of {chapters.length}
                </span>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${calculateChapterProgress(currentChapter)}%`,
                    }}
                  />
                </div>
                <span>
                  {Math.round(calculateChapterProgress(currentChapter))}%
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={!canGoNext}
                className="flex items-center"
              >
                Next
                <FiChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingModal;
