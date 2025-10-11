// pages/library/LibraryPage.jsx
import { useState, useEffect } from "react";
import { FiBook, FiDownload, FiSearch, FiCalendar, FiEye } from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const LibraryPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load purchased books from localStorage
    const loadPurchases = () => {
      setLoading(true);
      setTimeout(() => {
        const userLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]');
        setPurchases(userLibrary);
        setFilteredPurchases(userLibrary);
        setLoading(false);
      }, 1000);
    };

    loadPurchases();
  }, []);

  useEffect(() => {
    // Filter purchases based on search term
    const filtered = purchases.filter(purchase =>
      purchase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
  }, [searchTerm, purchases]);

  const handleDownload = (purchase) => {
    // Mock download functionality
    console.log(`Downloading: ${purchase.title}`);
    
    // In a real app, this would trigger file download
    alert(`Starting download: ${purchase.title}.${purchase.format.toLowerCase()}`);
    
    // Track download in localStorage
    const downloads = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    downloads.push({
      id: Math.random().toString(36).substr(2, 9),
      bookId: purchase.bookId,
      title: purchase.title,
      downloadedAt: new Date().toISOString(),
      format: purchase.format
    });
    localStorage.setItem('downloadHistory', JSON.stringify(downloads));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-600">Your purchased books and resources</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{purchases.length}</div>
            <div className="text-sm text-gray-600">Total Books</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {purchases.filter(p => p.format.includes('PDF')).length}
            </div>
            <div className="text-sm text-gray-600">PDF Books</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {purchases.filter(p => p.format.includes('EPUB')).length}
            </div>
            <div className="text-sm text-gray-600">EPUB Books</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${purchases.reduce((total, p) => total + p.price, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your library by title or author..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Books Grid */}
        {filteredPurchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBook className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Purchased
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {purchase.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">by {purchase.author}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FiCalendar className="h-4 w-4 mr-1" />
                      {formatDate(purchase.purchaseDate)}
                    </div>
                    <div className="font-medium text-gray-900">
                      ${purchase.price}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {purchase.format}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(purchase)}
                      >
                        <FiDownload className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {purchases.length === 0 ? 'Your library is empty' : 'No books found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {purchases.length === 0 
                ? 'Purchase your first book to start building your library!' 
                : 'Try adjusting your search terms.'
              }
            </p>
            {purchases.length === 0 && (
              <Button onClick={() => window.location.href = '/browse'}>
                Browse Books
              </Button>
            )}
          </Card>
        )}

        {/* Download History */}
        {purchases.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Download History</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Book
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Downloaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {JSON.parse(localStorage.getItem('downloadHistory') || '[]')
                      .slice(0, 5)
                      .map((download) => (
                      <tr key={download.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {download.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(download.downloadedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {download.format}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload({
                              ...download,
                              bookId: download.bookId,
                              title: download.title,
                              format: download.format
                            })}
                          >
                            <FiDownload className="h-4 w-4 mr-1" />
                            Download Again
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;