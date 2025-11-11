// src/pages/admin/AdminDashboard.jsx
import { Fragment, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiBook,
  FiUsers,
  FiBarChart2,
  FiHome,
  FiLogOut,
  FiFileText,
  FiUserCheck,
  FiDollarSign,
  FiActivity,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import { api } from "../../../config/apibac";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    logout();
    navigate("/");
  };

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalArticles: 0,
    activeAffiliates: 0,
    monthlyRevenue: 0,
    pendingReviews: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.getDashboardStats();
        if (response.success) {
          setStats(response.data.stats);
          setRecentActivity(response.data.recentActivity || []);
        } else {
          console.error('Failed to load dashboard stats:', response.message);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? "..." : value}
          </p>
          {change && (
            <p
              className={`text-xs mt-1 ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? "↑" : "↓"} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const QuickAction = ({ title, description, icon: Icon, action, color }) => (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={action}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} mr-4`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FiBook className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">Communiversity Library</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
              >
                <FiHome className="h-4 w-4 mr-2" />
                Back to Site
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-red-600 hover:text-red-700"
              >
                <FiLogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: "dashboard", name: "Dashboard", path: "/admin/dashboard" },
              { id: "books", name: "Books", path: "/admin/manage-books" },
              { id: "articles", name: "Articles", path: "/admin/articles" },
              {
                id: "webinars",
                name: "Webinars",
                path: "/admin/manage-webinars",
              },
              {
                id: "affiliates",
                name: "Affiliates",
                path: "/admin/affiliates",
              },
              { id: "users", name: "Users", path: "/admin/users" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  location.pathname === item.path
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, Admin!
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your library today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Books"
              value={stats.totalBooks.toLocaleString()}
              icon={FiBook}
              color="bg-blue-500"
            />
            <StatCard
              title="Registered Users"
              value={stats.totalUsers.toLocaleString()}
              icon={FiUsers}
              color="bg-green-500"
            />
            <StatCard
              title="Published Articles"
              value={stats.totalArticles}
              icon={FiFileText}
              color="bg-purple-500"
            />
            <StatCard
              title="Active Affiliates"
              value={stats.activeAffiliates}
              icon={FiUserCheck}
              color="bg-orange-500"
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${stats.monthlyRevenue.toLocaleString()}`}
              icon={FiDollarSign}
              color="bg-emerald-500"
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pendingReviews}
              icon={FiActivity}
              color="bg-red-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickAction
                title="Add New Book"
                description="Add a new book to the library"
                icon={FiBook}
                color="bg-blue-500"
                action={() => navigate("/admin/manage-books")}
              />
              <QuickAction
                title="Write Article"
                description="Create a new blog article"
                icon={FiFileText}
                color="bg-purple-500"
                action={() => navigate("/admin/articles")}
              />
              <QuickAction
                title="Manage Users"
                description="View and manage users"
                icon={FiUsers}
                color="bg-green-500"
                action={() => navigate("/admin/users")}
              />
              <QuickAction
                title="Affiliate Requests"
                description="Review affiliate applications"
                icon={FiUserCheck}
                color="bg-orange-500"
                action={() => navigate("/admin/affiliates")}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Loading activity...</p>
              ) : recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No recent activity. Activity will appear here as users interact with the library.
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "book"
                            ? "bg-blue-100"
                            : activity.type === "article"
                            ? "bg-purple-100"
                            : activity.type === "user"
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {activity.type === "book" && (
                          <FiBook className="h-4 w-4 text-blue-600" />
                        )}
                        {activity.type === "article" && (
                          <FiFileText className="h-4 w-4 text-purple-600" />
                        )}
                        {activity.type === "user" && (
                          <FiUsers className="h-4 w-4 text-green-600" />
                        )}
                        {activity.type === "affiliate" && (
                          <FiUserCheck className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user} {activity.action} {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;