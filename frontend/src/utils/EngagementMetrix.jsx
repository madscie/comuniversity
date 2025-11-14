import React from 'react';
import Card from "../components/UI/Card";
import { FiClock, FiEye, FiRotateCw, FiUserCheck } from 'react-icons/fi';

const EngagementMetrics = ({ data }) => {
  const metrics = [
    {
      title: 'Avg. Session Duration',
      value: data?.engagementMetrics?.avgSessionDuration || '0:00',
      icon: FiClock,
      description: 'Time spent per visit'
    },
    {
      title: 'Pages per Session',
      value: data?.engagementMetrics?.pagesPerSession || '0',
      icon: FiEye,
      description: 'Average pages viewed'
    },
    {
      title: 'Bounce Rate',
      value: `${data?.engagementMetrics?.bounceRate || '0'}%`,
      icon: FiRotateCw,
      description: 'Single-page sessions'
    },
    {
      title: 'Returning Visitors',
      value: `${data?.engagementMetrics?.returningVisitors || '0'}%`,
      icon: FiUserCheck,
      description: 'Repeat visitors rate'
    }
  ];

  return (
    <Card className="p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Engagement Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-3">
              <metric.icon className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {metric.value}
            </h4>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {metric.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EngagementMetrics;