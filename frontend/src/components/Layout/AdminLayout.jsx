import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiBook,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiHome,
  FiLogOut,
  FiFileText,
  FiUserCheck,
  FiVideo,
} from "react-icons/fi";
import { useAuthStore } from "../../store/clerkAuthStore";

// Enhanced Loading Spinner
const LoadingSpinner = ({ size = "medium" }) => {
  const sizes = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          className={`${sizes[size]} border-2 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${sizes[size]} border-2 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin`}
        ></div>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: FiBarChart2,
      path: "/admin/dashboard",
    },
    {
      id: "books",
      name: "Manage Books",
      icon: FiBook,
      path: "/admin/manage-books",
    },
    {
      id: "articles",
      name: "Manage Articles",
      icon: FiFileText,
      path: "/admin/articles",
    },
    {
      id: "webinars",
      name: "Manage Webinars",
      icon: FiVideo,
      path: "/admin/manage-webinars",
    },
    {
      id: "affiliates",
      name: "Affiliates",
      icon: FiUserCheck,
      path: "/admin/affiliates",
    },
    {
      id: "users",
      name: "User Management",
      icon: FiUsers,
      path: "/admin/users",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-green-600 rounded-lg flex items-center justify-center">
              <FiBook className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Communiversity Library
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-r-2 border-green-700 dark:border-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => navigate("/")}
            className="w-40 flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg mb-2 transition-colors duration-200"
          >
            <FiHome className="h-5 w-5 mr-3" />
            Back to Site
          </button>
          <button
            onClick={handleLogout}
            className="w-40 flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-colors duration-200"
          >
            <FiLogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
