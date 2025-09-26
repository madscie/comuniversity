import { FiBook, FiUsers, FiPlus, FiSearch } from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const OverviewPanel = () => {
  const stats = [
    {
      label: "Total Books",
      value: "2,543",
      icon: FiBook,
      change: "+12%",
      trend: "up",
    },
    {
      label: "Active Users",
      value: "1,287",
      icon: FiUsers,
      change: "+5%",
      trend: "up",
    },
    {
      label: "New This Month",
      value: "47",
      icon: FiPlus,
      change: "+8%",
      trend: "up",
    },
    {
      label: "Searches Today",
      value: "324",
      icon: FiSearch,
      change: "-3%",
      trend: "down",
    },
  ];

  const recentActivity = [
    {
      action: "New Book Added",
      title: "Introduction to Quantum Computing",
      time: "2 hours ago",
    },
    {
      action: "User Registration",
      title: "Sarah Johnson",
      time: "5 hours ago",
    },
    { action: "Book Updated", title: "Advanced Calculus", time: "Yesterday" },
    {
      action: "Popular Search",
      title: "Artificial Intelligence",
      time: "2 days ago",
    },
  ];

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
            <p className="text-gray-900 font-medium">Today at 14:32</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
                <p
                  className={`text-sm mt-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change} from last month
                </p>
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
            {recentActivity.map((activity, index) => (
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
            ))}
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
