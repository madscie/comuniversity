import { useState, useEffect } from "react";
import { FiBook, FiUsers, FiPlus, FiSearch } from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const OverviewPanel = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const statsResponse = await fetch('/api/admin/dashboard/stats');
      // const statsData = await statsResponse.json();
      // setStats(statsData);
      
      // const activityResponse = await fetch('/api/admin/dashboard/activity');
      // const activityData = await activityResponse.json();
      // setRecentActivity(activityData);

      // Temporary empty state until backend is ready
      setStats([]);
      setRecentActivity([]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Empty state on error
      setStats([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  // Default stat structure for when we have no data
  const defaultStats = [
    {
      label: "Total Books",
      value: "0",
      icon: FiBook,
      change: null,
      trend: null,
    },
    {
      label: "Active Users",
      value: "0",
      icon: FiUsers,
      change: null,
      trend: null,
    },
    {
      label: "New This Month",
      value: "0",
      icon: FiPlus,
      change: null,
      trend: null,
    },
    {
      label: "Searches Today",
      value: "0",
      icon: FiSearch,
      change: null,
      trend: null,
    },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Welcome back, Administrator</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last login</p>
            <p className="text-gray-900 font-medium">
              {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat, index) => (
          <Card
            key={index}
            className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                {stat.change && (
                  <p
                    className={`text-sm mt-1 ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change} from last month
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">
                  Activity will appear here as users interact with the system
                </p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{activity.title}</p>
                  </div>
                  <span className="text-gray-500 text-sm">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Button variant="primary" className="w-full justify-center py-3">
              <FiPlus className="mr-2 h-5 w-5" />
              Add New Book
            </Button>
            <Button variant="outline" className="w-full justify-center py-3">
              <FiBook className="mr-2 h-5 w-5" />
              Manage Books
            </Button>
            <Button variant="outline" className="w-full justify-center py-3">
              <FiUsers className="mr-2 h-5 w-5" />
              View Users
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewPanel;