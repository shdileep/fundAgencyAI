import React from 'react';
import { useApp } from '../../context/AppContext';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const Insights = () => {
  const { fundingCalls } = useApp();

  const activeCount = fundingCalls.filter(c => c.status === 'Active').length;
  const expiredCount = fundingCalls.filter(c => c.status === 'Expired').length;
  const archivedCount = fundingCalls.filter(c => c.status === 'Archived').length;
  const totalCount = fundingCalls.length;

  const statusData = [
    { name: 'Active', value: activeCount, color: '#4F46E5' }, // Indigo
    { name: 'Expired', value: expiredCount, color: '#EF4444' }, // Red
    { name: 'Archived', value: archivedCount, color: '#9CA3AF' } // Gray
  ];

  // Calls by Agency (Top 5)
  const agencyCount: Record<string, number> = {};
  fundingCalls.forEach(call => {
    agencyCount[call.agency] = (agencyCount[call.agency] || 0) + 1;
  });
  
  const agencyData = Object.entries(agencyCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Insights</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <p className="text-gray-500">Total Calls Posted</p>
          <h3 className="text-3xl font-bold">{totalCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500">Active Opportunities</p>
          <h3 className="text-3xl font-bold">{activeCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-gray-500">Expired / Completed</p>
          <h3 className="text-3xl font-bold">{expiredCount + archivedCount}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Funding Status Distribution</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Top Funding Agencies</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4F46E5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
