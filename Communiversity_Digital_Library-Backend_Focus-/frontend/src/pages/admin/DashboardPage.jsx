// src/pages/admin/DashboardPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBook,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiSearch,
  FiPlus,
  FiEdit,
  FiLogOut,
  FiHome,
  FiGrid,
  FiDatabase,
  FiUserCheck,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import OverviewPanel from "./Panels/OverviewPanel";
import BooksPanel from "./Panels/BookPanel";
import UsersPanel from "./Panels/UserPanel";
import SettingsPanel from "./Panels/SettingsPanel";
import { useAuthStore } from "../../store/authStore";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState("overview");
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("adminUser");
    // Update auth store
    logout();
    navigate("/");
  };

  // Render the appropriate panel based on activePanel state
  const renderActivePanel = () => {
    switch (activePanel) {
      case "overview":
        return <OverviewPanel />;
      case "books":
        return <BooksPanel />;
      case "users":
        return <UsersPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 p-6">
        <div className="flex items-center justify-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <FiBook className="h-6 w-6 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActivePanel("overview")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activePanel === "overview"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FiBarChart2 className="h-5 w-5 mr-3" />
            Overview
          </button>

          <button
            onClick={() => setActivePanel("books")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activePanel === "books"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FiBook className="h-5 w-5 mr-3" />
            Manage Books
          </button>

          <button
            onClick={() => setActivePanel("users")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activePanel === "users"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FiUsers className="h-5 w-5 mr-3" />
            User Management
          </button>

          <button
            onClick={() => setActivePanel("settings")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activePanel === "settings"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FiSettings className="h-5 w-5 mr-3" />
            Settings
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full mb-2 text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-300"
          >
            <FiHome className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-gray-500 hover:text-red-500"
          >
            <FiLogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Panel Content */}
        {renderActivePanel()}
      </div>
    </div>
  );
};

export default DashboardPage;
