import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiBook, FiDownload, FiHeart, FiShare2, FiStar, FiUsers, FiCalendar, FiGlobe, FiBookOpen } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

// Mock books data matching your BrowsePage structure
const booksData = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    author: "Dr. Sarah Johnson",
    description: "A comprehensive guide to computer science fundamentals including algorithms, data structures, and programming principles. Perfect for beginners and students looking to build a strong foundation in computing.",
    coverImage: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400",
    publishedDate: "2023",
    genre: "Computer Science",
    pages: 320,
    isbn: "978-0-123456-78-9",
    publisher: "Tech Publications",
    language: "English",
    rating: 4.5,
    downloads: 15420,
    category: "000-099",
    deweyNumber: "004.01",
    content: `Chapter 1: Introduction to Computing\n\nComputers have revolutionized the way we live, work, and communicate. This chapter explores the fundamental concepts of computing and its impact on society.\n\nWhat is a Computer?\nA computer is an electronic device that processes data according to a set of instructions called a program. Modern computers can perform billions of calculations per second...`,
    tags: ["Programming", "Algorithms", "Data Structures", "Beginner"],
    fileSize: "45.2 MB",
    format: "PDF, EPUB, MOBI"
  },
  {
    id: 2,
    title: "Advanced Mathematics for Engineers",
    author: "Professor Michael Chen",
    description: "Advanced mathematical concepts and techniques essential for engineering applications. Covers calculus, differential equations, and numerical methods with practical examples.",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    publishedDate: "2022",
    genre: "Mathematics",
    pages: 480,
    isbn: "978-0-987654-32-1",
    publisher: "Academic Press",
    language: "English",
    rating: 4.3,
    downloads: 8920,
    category: "500-599",
    deweyNumber: "510.2462",
    content: `Chapter 1: Advanced Calculus\n\nThis chapter delves into the sophisticated world of calculus, building upon fundamental principles to explore more complex mathematical concepts...`,
    tags: ["Engineering", "Calculus", "Differential Equations", "Advanced"],
    fileSize: "67.8 MB",
    format: "PDF"
  },
  {
    id: 3,
    title: "World History: Ancient Civilizations",
    author: "Dr. Emily Rodriguez",
    description: "Explore the rise and fall of ancient civilizations from Mesopotamia to Rome. Richly illustrated with maps and archaeological findings.",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    publishedDate: "2021",
    genre: "History",
    pages: 560,
    isbn: "978-0-456789-12-3",
    publisher: "History Press",
    language: "English",
    rating: 4.7,
    downloads: 12340,
    category: "900-999",
    deweyNumber: "930.1",
    content: `Chapter 1: The Dawn of Civilization\n\nHuman civilization began in the fertile crescent of Mesopotamia, where the first cities and writing systems emerged around 3500 BCE...`,
    tags: ["Ancient History", "Archaeology", "Civilizations", "World History"],
    fileSize: "89.3 MB",
    format: "PDF, EPUB"
  }
];

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const foundBook = booksData.find(b => b.id === parseInt(id));
    if (foundBook) {
      setBook(foundBook);
      // Check if book is in favorites (mock implementation)
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(foundBook.id));
    }
  }, [id]);

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
          <p className="text-gray-600 mb-6">The book you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/browse")}>
            <FiArrowLeft className="mr-2" />
            Back to Browse
          </Button>
        </Card>
      </div>
    );
  }

  const handleReadOnline = () => {
    setIsReading(true);
    setCurrentPage(0);
  };

  const handleDownload = (format) => {
    alert(`Downloading "${book.title}" in ${format} format...`);
    // In a real app, this would trigger an actual download
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter(favId => favId !== book.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      favorites.push(book.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const pages = book.content.split('\n\n');

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={toggleFavorite}
              className={`flex items-center ${
                isFavorite ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <FiHeart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              className="flex items-center text-gray-600"
            >
              <FiShare2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Book Header */}
        <Card className="mb-8 border-0 shadow-xl">
          <div className="flex flex-col lg:flex-row">
            {/* Book Cover */}
            <div className="lg:w-1/3 p-8 flex justify-center">
              <div className="relative group">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-64 h-80 object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:w-2/3 p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {book.category} • {book.deweyNumber}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{book.title}</h1>
              <p className="text-xl text-gray-700 mb-6">by {book.author}</p>

              {/* Rating and Downloads */}
              <div className="flex items-center mb-6 space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(book.rating)}
                  <span className="ml-2 text-gray-700 font-medium">{book.rating}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiUsers className="mr-1 h-4 w-4" />
                  {book.downloads.toLocaleString()} downloads
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-8">{book.description}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick={handleReadOnline}
                  className="flex items-center px-6 py-3"
                >
                  <FiBookOpen className="mr-2 h-5 w-5" />
                  Read Online
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDownload('PDF')}
                  className="flex items-center px-6 py-3"
                >
                  <FiDownload className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload('EPUB')}
                  className="flex items-center px-6 py-3"
                >
                  <FiBook className="mr-2 h-5 w-5" />
                  Download EPUB
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Book Details Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiCalendar className="mr-2 h-5 w-5 text-blue-600" />
                Publication Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-medium">{book.publishedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Publisher:</span>
                  <span className="font-medium">{book.publisher}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{book.pages}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiGlobe className="mr-2 h-5 w-5 text-green-600" />
                Technical Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ISBN:</span>
                  <span className="font-medium">{book.isbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{book.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="font-medium">{book.fileSize}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiBook className="mr-2 h-5 w-5 text-purple-600" />
                Categories & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Related Books */}
        <Card className="border-0 shadow-xl">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Books</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {booksData
                .filter(b => b.id !== book.id && b.category === book.category)
                .slice(0, 3)
                .map(relatedBook => (
                  <Link
                    key={relatedBook.id}
                    to={`/books/${relatedBook.id}`}
                    className="block group"
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={relatedBook.coverImage}
                            alt={relatedBook.title}
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {relatedBook.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{relatedBook.author}</p>
                            <div className="flex items-center mt-2">
                              {renderStars(relatedBook.rating)}
                              <span className="ml-2 text-sm text-gray-600">{relatedBook.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Reading Modal */}
      {isReading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Reading: {book.title}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setIsReading(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </Button>
            </div>
            
            <div className="p-6 h-96 overflow-y-auto">
              <div className="prose max-w-none text-lg leading-relaxed">
                <h3 className="text-xl font-semibold mb-4">
                  Page {currentPage + 1} of {pages.length}
                </h3>
                <div className="whitespace-pre-wrap">
                  {pages[currentPage]}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous Page
              </Button>
              
              <span className="text-gray-600">
                {currentPage + 1} / {pages.length}
              </span>
              
              <Button
                variant="primary"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
              >
                Next Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;