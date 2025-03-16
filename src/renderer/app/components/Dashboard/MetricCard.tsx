import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label, trend }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-full bg-blue-50">{icon}</div>
        {trend && (
          <div className={`px-2 py-1 rounded-full text-sm ${trend.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-semibold">{value}</h3>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  );
};

export default MetricCard; 