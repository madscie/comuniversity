import React from "react";
import Card from "../components/UI/Card";
// import LineChart from '../UI/Charts/LineChart';
// import BarChart from '../UI/Charts/BarChart';
// import PieChart from '../UI/Charts/PieChart';

import LineChart from "../components/UI/Charts/LineCharts";
import BarChart from "../components/UI/Charts/BarCharts";
import PieChart from "../components/UI/Charts/PieCharts";

const ChartsSection = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* User Growth Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          User Growth
        </h3>
        <LineChart data={data?.userGrowth || []} height={200} color="#16a34a" />
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Total users:{" "}
          {data?.userGrowth?.[
            data.userGrowth.length - 1
          ]?.value.toLocaleString()}
        </div>
      </Card>

      {/* Revenue Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Trends
        </h3>
        <BarChart
          data={data?.revenueTrends || []}
          height={200}
          color="#2563eb"
        />
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Monthly revenue: ${data?.overview?.totalRevenue.toLocaleString()}
        </div>
      </Card>

      {/* Popular Content */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Content Categories
        </h3>
        <div className="flex items-center">
          <PieChart data={data?.popularContent || []} />
          <div className="ml-6 flex-1">
            {data?.popularContent?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between mb-2"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: [
                        "#16a34a",
                        "#dc2626",
                        "#2563eb",
                        "#f59e0b",
                        "#8b5cf6",
                      ][index],
                    }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* User Demographics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          User Demographics
        </h3>
        <div className="space-y-3">
          {data?.userDemographics?.map((demo, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">
                  {demo.label}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {demo.value}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${demo.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ChartsSection;
