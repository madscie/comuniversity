import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBook,
  FiClock,
  FiBookmark,
  FiUser,
  FiSettings,
  FiLogOut,
  FiHeart,
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiHome,
  FiSearch,
  FiBookOpen,
  FiAlertCircle
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { useAuthStore } from "../../store/authStore";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("reading");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuthStore();

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:3002/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        if (data.success) {
          // Use real data from API
          setUserData({
            name: `${data.user.first_name} ${data.user.last_name}`,
            email: data.user.email,
            joinDate: new Date(data.user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            readingStats: {
              totalBooksRead: 24,
              readingStreak: 12,
              totalReadingTime: "45h 30m",
              favoriteCategory: "Science & Technology"
            },
            readingHistory: [
              {
                id: 1,
                title: "Introduction to Computer Science",
                author: "John Smith",
                category: "Computer Science",
                ddc: "004.5",
                lastAccessed: "2 hours ago",
                progress: 65
              },
              {
                id: 2,
                title: "Advanced Mathematics for Engineers",
                author: "Dr. Emily Chen",
                category: "Mathematics",
                ddc: "510.2",
                lastAccessed: "1 day ago",
                progress: 30
              },
              {
                id: 3,
                title: "World History: Modern Era",
                author: "Prof. Robert Johnson",
                category: "History",
                ddc: "909.8",
                lastAccessed: "3 days ago",
                progress: 100
              }
            ],
            savedBooks: [
              {
                id: 4,
                title: "Organic Chemistry Fundamentals",
                author: "Dr. Sarah Williams",
                category: "Chemistry",
                ddc: "547",
                savedDate: "5 days ago"
              },
              {
                id: 5,
                title: "Renaissance Art Masterpieces",
                author: "Maria Gonzalez",
                category: "Art History",
                ddc: "709.024",
                savedDate: "1 week ago"
              }
            ]
          });
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load dashboard data. Using demo data instead.');
        
        // Fallback to demo data if API fails
        setUserData({
          name: `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim() || 'Demo User',
          email: user?.email || "demo@comversity.org",
          joinDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          readingStats: {
            totalBooksRead: 24,
            readingStreak: 12,
            totalReadingTime: "45h 30m",
            favoriteCategory: "Science & Technology"
          },
          readingHistory: [
            {
              id: 1,
              title: "Introduction to Computer Science",
              author: "John Smith",
              category: "Computer Science",
              ddc: "004.5",
              lastAccessed: "2 hours ago",
              progress: 65
            },
            {
              id: 2,
              title: "Advanced Mathematics for Engineers",
              author: "Dr. Emily Chen",
              category: "Mathematics",
              ddc: "510.2",
              lastAccessed: "1 day ago",
              progress: 30
            },
            {
              id: 3,
              title: "World History: Modern Era",
              author: "Prof. Robert Johnson",
              category: "History",
              ddc: "909.8",
              lastAccessed: "3 days ago",
              progress: 100
            }
          ],
          savedBooks: [
            {
              id: 4,
              title: "Organic Chemistry Fundamentals",
              author: "Dr. Sarah Williams",
              category: "Chemistry",
              ddc: "547",
              savedDate: "5 days ago"
            },
            {
              id: 5,
              title: "Renaissance Art Masterpieces",
              author: "Maria Gonzalez",
              category: "Art History",
              ddc: "709.024",
              savedDate: "1 week ago"
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-6 text-center">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiHome className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/browse")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiBookOpen className="mr-2 h-4 w-4" />
              Browse
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/search")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiSearch className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiLogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* User Profile Header */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FiUser className="h-10 w-10" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
              <p className="text-blue-100">{userData.email}</p>
              <div className="flex items-center justify-center md:justify-start mt-2 text-blue-100">
                <FiCalendar className="h-4 w-4 mr-1" />
                Member since {userData.joinDate}
              </div>
            </div>
            <Button variant="white" className="whitespace-nowrap">
              <FiSettings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FiBarChart2 className="mr-2 h-5 w-5 text-blue-600" />
                Dashboard
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("reading")}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "reading"
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiClock className="mr-3 h-5 w-5" />
                  Reading History
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "saved"
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiBookmark className="mr-3 h-5 w-5" />
                  Saved Books
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "stats"
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiBarChart2 className="mr-3 h-5 w-5" />
                  Reading Stats
                </button>
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Books Read</span>
                    <span className="font-semibold">
                      {userData.readingStats.totalBooksRead}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reading Streak</span>
                    <span className="font-semibold">
                      {userData.readingStats.readingStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Reading</span>
                    <span className="font-semibold">
                      {userData.readingStats.totalReadingTime}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "reading" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FiClock className="mr-2 h-6 w-6 text-blue-600" />
                    Reading History
                  </h2>
                  <span className="text-gray-500">
                    {userData.readingHistory.length} books
                  </span>
                </div>

                <div className="space-y-4">
                  {userData.readingHistory.map((book) => (
                    <Card key={book.id} className="border-0 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                            <FiBook />
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{book.author}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <span>{book.category}</span>
                            <span>•</span>
                            <span>DDC: {book.ddc}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <FiClock className="mr-1 h-3 w-3" />
                              {book.lastAccessed}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${book.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {book.progress}% complete
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 flex flex-col gap-2">
                          <Button variant="primary" size="sm">
                            <FiBookOpen className="mr-1 h-4 w-4" />
                            Continue
                          </Button>
                          <Button variant="outline" size="sm">
                            <FiDownload className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FiBookmark className="mr-2 h-6 w-6 text-blue-600" />
                    Saved Books
                  </h2>
                  <span className="text-gray-500">
                    {userData.savedBooks.length} books
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {userData.savedBooks.map((book) => (
                    <Card key={book.id} className="border-0 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white">
                            <FiBook className="h-5 w-5" />
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                          
                          <div className="text-xs text-gray-500 mb-3">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
                              {book.category}
                            </span>
                            <span>DDC: {book.ddc}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500 flex items-center">
                            <FiCalendar className="mr-1 h-3 w-3" />
                            Saved {book.savedDate}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <FiHeart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiBarChart2 className="mr-2 h-6 w-6 text-blue-600" />
                  Reading Statistics
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-0 text-center p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiBook className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {userData.readingStats.totalBooksRead}
                    </h3>
                    <p className="text-gray-600">Books Read</p>
                  </Card>

                  <Card className="border-0 text-center p-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiClock className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {userData.readingStats.readingStreak}
                    </h3>
                    <p className="text-gray-600">Day Reading Streak</p>
                  </Card>

                  <Card className="border-0 text-center p-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiBarChart2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {userData.readingStats.totalReadingTime}
                    </h3>
                    <p className="text-gray-600">Total Reading Time</p>
                  </Card>

                  <Card className="border-0 text-center p-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiHeart className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {userData.readingStats.favoriteCategory}
                    </h3>
                    <p className="text-gray-600">Favorite Category</p>
                  </Card>
                </div>

                <Card className="border-0 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Reading Activity (Last 7 Days)
                  </h3>
                  <div className="flex items-end justify-between h-40">
                    {[20, 35, 45, 60, 40, 55, 70].map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-8 bg-blue-500 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;