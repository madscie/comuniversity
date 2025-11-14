import React from 'react';
import { FiTrendingUp, FiUsers, FiDownload, FiDollarSign } from 'react-icons/fi';
import Card from '../components/UI/Card';

const MetricsGrid = ({ data }) => {
  const metrics = [
    {
      title: 'Monthly Revenue',
      value: `$${data?.overview?.totalRevenue.toLocaleString()}`,
      change: '+23%',
      icon: FiDollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: data?.overview?.activeUsers.toLocaleString(),
      change: '+8%',
      icon: FiUsers,
      color: 'text-blue-600'
    },
    {
      title: 'New Registrations',
      value: data?.overview?.newRegistrations.toLocaleString(),
      change: '+15%',
      icon: FiTrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Content Downloads',
      value: data?.overview?.contentDownloads.toLocaleString(),
      change: '+12%',
      icon: FiDownload,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {metric.value}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {metric.change} from last month
              </p>
            </div>
            <div className={`p-3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MetricsGrid;