// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiSearch,
//   FiBookOpen,
//   FiArrowRight,
//   FiBarChart2,
// } from "react-icons/fi";
// import { useAuthStore } from "../../store/authStore"; // ADD THIS IMPORT
// import TextInput from "../../components/UI/TextInput";
// import Card from "../../components/UI/Card";
// import Button from "../../components/UI/Button";
// import AdminLoginModal from "../../pages/admin/AdminLoginModal";

// const HomePage = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

//   // CORRECTLY ACCESS isAuthenticated from the auth store
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
//     }
//   };

//   // Check if user is already authenticated on component mount
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/admin/dashboard");
//     }
//   }, [isAuthenticated, navigate]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <section className="text-center mb-16 mt-8">
//         <div className="relative inline-block">
//           <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-2xl opacity-30"></div>
//           <h1 className="text-5xl md:text-6xl font-bold text-gray-900 relative">
//             Welcome to{" "}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
//               Communiversity
//             </span>
//           </h1>
//         </div>

//         <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto mt-6 leading-relaxed">
//           Explore our digital collection of{" "}
//           <span className="font-semibold text-blue-600">2,500+ books</span>,
//           meticulously organized with the Dewey Decimal System for seamless
//           discovery and learning.
//         </p>

//         <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
//           <div className="relative group">
//             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
//             <div className="relative">
//               <TextInput
//                 type="text"
//                 placeholder="🔍 Search titles, authors, or subjects..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 required
//                 className="w-full pl-6 pr-14 py-4 text-lg border-0 shadow-2xl backdrop-blur-sm bg-white/95"
//               />
//               <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-600" />
//             </div>
//           </div>

//           <Button
//             type="submit"
//             variant="gradient"
//             className="mt-6 w-full py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform duration-300"
//           >
//             <FiSearch className="mr-3 h-6 w-6" />
//             Explore Our Collection
//           </Button>
//         </form>

//         <div className="flex flex-wrap justify-center gap-6">
//           <Button
//             variant="primary"
//             onClick={() => navigate("/browse")}
//             className="px-8 py-4 text-lg font-semibold group"
//           >
//             <FiBookOpen className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
//             Browse Full Catalog
//             <FiArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
//           </Button>
//         </div>
//       </section>

//       <section className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-20">
//         <Card className="text-center group hover:scale-105 transition-transform duration-300">
//           <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
//             <FiBookOpen className="h-10 w-10 text-blue-600" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-900 mb-4">
//             Smart Organization
//           </h3>
//           <p className="text-gray-600 leading-relaxed">
//             Books systematically categorized using the proven Dewey Decimal
//             classification system.
//           </p>
//         </Card>

//         <Card className="text-center group hover:scale-105 transition-transform duration-300">
//           <div className="mx-auto bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
//             <FiSearch className="h-10 w-10 text-green-600" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-900 mb-4">
//             Advanced Search
//           </h3>
//           <p className="text-gray-600 leading-relaxed">
//             Intelligent search across titles, authors, and subjects with instant
//             results.
//           </p>
//         </Card>

//         <Card className="text-center group hover:scale-105 transition-transform duration-300">
//           <div className="mx-auto bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
//             <FiArrowRight className="h-10 w-10 text-purple-600" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-900 mb-4">
//             Instant Access
//           </h3>
//           <p className="text-gray-600 leading-relaxed">
//             Begin your knowledge journey with seamless, intuitive navigation and
//             discovery.
//           </p>
//         </Card>

//         {/* Admin Access Card - Added as fourth card */}
//         <Card className="text-center group hover:scale-105 transition-transform duration-300">
//           <div className="mx-auto bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
//             <FiBarChart2 className="h-10 w-10 text-gray-600" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-900 mb-4">
//             Admin Access
//           </h3>
//           <p className="text-gray-600 leading-relaxed">
//             Librarian tools for managing the digital collection and user
//             accounts.
//           </p>
//           <Button
//             variant="outline"
//             className="mt-4"
//             onClick={() => setIsAdminModalOpen(true)}
//           >
//             Admin Login
//           </Button>
//         </Card>
//       </section>

//       <AdminLoginModal
//         isOpen={isAdminModalOpen}
//         onClose={() => setIsAdminModalOpen(false)}
//       />
//     </div>
//   );
// };

// export default HomePage;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBookOpen,
  FiArrowRight,
  FiBarChart2,
  FiUser,
  FiBook,
  FiClock,
  FiLogOut,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import TextInput from "../../components/UI/TextInput";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import AdminLoginModal from "../../pages/admin/AdminLoginModal";
import UserAuthModal from "../../components/UserAuthModal"; // Add this import

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false); // Add this state
  
  // Access auth store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Mock user data for dashboard
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // In a real app, this would come from an API
      const mockUserData = {
        name: user.firstName || user.name || "User",
        readingStats: {
          totalBooksRead: 12,
          readingStreak: 5,
          totalReadingTime: "22h 15m",
        },
        recentBooks: [
          {
            id: 1,
            title: "Introduction to Computer Science",
            author: "John Smith",
            progress: 65,
            lastAccessed: "2 hours ago",
          },
          {
            id: 2,
            title: "Advanced Mathematics for Engineers",
            author: "Dr. Emily Chen",
            progress: 30,
            lastAccessed: "1 day ago",
          },
        ],
      };
      setUserData(mockUserData);
    } else {
      setUserData(null);
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUserData(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* User Dashboard Section - Only shown when authenticated */}
      {isAuthenticated && userData && (
        <section className="w-full max-w-6xl mb-12 mt-8">
          <Card className="border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between p-6">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUser className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {userData.name}!</h2>
                  <p className="text-blue-100">Continue your reading journey</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="white" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="white-outline" onClick={handleLogout} className="flex items-center">
                  <FiLogOut className="mr-1 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* Reading Stats */}
            <Card className="border-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiBarChart2 className="mr-2 h-5 w-5 text-blue-600" />
                Reading Stats
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
            </Card>

            {/* Continue Reading */}
            <Card className="border-0 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiClock className="mr-2 h-5 w-5 text-blue-600" />
                Continue Reading
              </h3>
              <div className="space-y-4">
                {userData.recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <FiBook className="h-5 w-5" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{book.title}</h4>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {book.progress}% complete • {book.lastAccessed}
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      Continue
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Main Content - Shown to all users */}
      <section className="text-center mb-16 mt-8">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-2xl opacity-30"></div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 relative">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Communiversity
            </span>
          </h1>
        </div>

        <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto mt-6 leading-relaxed">
          Explore our digital collection of{" "}
          <span className="font-semibold text-blue-600">2,500+ books</span>,
          meticulously organized with the Dewey Decimal System for seamless
          discovery and learning.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative">
              <TextInput
                type="text"
                placeholder="🔍 Search titles, authors, or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
                className="w-full pl-6 pr-14 py-4 text-lg border-0 shadow-2xl backdrop-blur-sm bg-white/95"
              />
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-600" />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="mt-6 w-full py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <FiSearch className="mr-3 h-6 w-6" />
            Explore Our Collection
          </Button>
        </form>

        <div className="flex flex-wrap justify-center gap-6">
          <Button
            variant="primary"
            onClick={() => navigate("/browse")}
            className="px-8 py-4 text-lg font-semibold group"
          >
            <FiBookOpen className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            Browse Full Catalog
            <FiArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          
          {/* Add User Login Button if not authenticated */}
          {!isAuthenticated && (
            <Button
              variant="secondary"
              onClick={() => setIsUserAuthModalOpen(true)}
              className="px-8 py-4 text-lg font-semibold group"
            >
              <FiUser className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              User Login / Register
            </Button>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-20">
        {/* ... (keep your existing cards) ... */}
      </section>

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
      
      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;