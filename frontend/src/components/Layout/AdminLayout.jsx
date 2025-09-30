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
import { useAuthStore } from "../../store/authStore";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    logout();
    navigate("/");
  };
  // In your AdminLayout component, update the menuItems array:
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FiBook className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Communityersity Library</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 bottom-4 left-4 right-4">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg mb-2"
          >
            <FiHome className="h-5 w-5 mr-3" />
            Back to Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
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
