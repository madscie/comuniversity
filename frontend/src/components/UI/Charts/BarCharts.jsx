import React from 'react';

const BarChart = ({ data, width = '100%', height = 200, color = '#16a34a' }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="relative" style={{ width, height }}>
      <div className="flex items-end justify-between h-full space-x-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t transition-all duration-500 hover:opacity-80"
              style={{
                height: `${(item.value / maxValue) * 80}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;