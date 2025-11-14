import React from 'react';

const PieChart = ({ data, width = 120, height = 120 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const colors = ['#16a34a', '#dc2626', '#2563eb', '#f59e0b', '#8b5cf6'];

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} viewBox="0 0 42 42">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const x1 = 21 + 16 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 21 + 16 * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = 21 + 16 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
          const y2 = 21 + 16 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
          
          const pathData = [
            `M 21 21`,
            `L ${x1} ${y1}`,
            `A 16 16 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');
          
          const segment = (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="#fff"
              strokeWidth="1"
            />
          );
          
          currentAngle += angle;
          return segment;
        })}
        <circle cx="21" cy="21" r="8" fill="#fff" />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-700">{total}</span>
      </div>
    </div>
  );
};

export default PieChart;