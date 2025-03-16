import React from 'react';

interface SalesTeamMember {
  id: string;
  name: string;
  avatar: string;
  target: number;
  achieved: number;
}

interface SalesPerformanceProps {
  teamMembers: SalesTeamMember[];
}

const SalesPerformance: React.FC<SalesPerformanceProps> = ({ teamMembers }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Sales Team Performance</h2>
        <a href="#" className="text-blue-500 text-sm">View All</a>
      </div>
      <div className="space-y-4">
        {teamMembers.map((member) => {
          const percentage = (member.achieved / member.target) * 100;
          const color = percentage >= 60 ? 'bg-green-500' : percentage >= 40 ? 'bg-blue-500' : 'bg-red-500';
          
          return (
            <div key={member.id} className="flex items-center space-x-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-gray-500">Sales target completion {percentage.toFixed(0)}%</p>
                <div className="mt-2 h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full border-4 ${color.replace('bg-', 'border-')} flex items-center justify-center`}>
                <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesPerformance; 