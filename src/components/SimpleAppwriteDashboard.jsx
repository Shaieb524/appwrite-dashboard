import React, { useState, useEffect } from 'react';

// Simple mock data for testing
const mockData = {
  totalUsers: 1250,
  activeSessions: 320,
  newUsers: 45
};

const SimpleAppwriteDashboard = () => {
  const [stats, setStats] = useState(mockData);
  
  // In a real app, you would fetch from Appwrite here
  useEffect(() => {
    // This would be replaced with actual API calls
    console.log("Dashboard mounted");
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Appwrite Project Dashboard</h1>
        <p className="text-gray-600">Monitor your accounts and sessions</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Users Card */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
        </div>
        
        {/* Active Sessions Card */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Sessions</h3>
          <p className="text-2xl font-bold mt-2">{stats.activeSessions}</p>
        </div>
        
        {/* New Users Card */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">New Users (24h)</h3>
          <p className="text-2xl font-bold mt-2">{stats.newUsers}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold text-lg mb-4">Recent Users</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left pb-2">ID</th>
              <th className="text-left pb-2">Email</th>
              <th className="text-left pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">user123</td>
              <td className="py-2">user1@example.com</td>
              <td className="py-2">3 hours ago</td>
            </tr>
            <tr>
              <td className="py-2">user456</td>
              <td className="py-2">user2@example.com</td>
              <td className="py-2">5 hours ago</td>
            </tr>
            <tr>
              <td className="py-2">user789</td>
              <td className="py-2">user3@example.com</td>
              <td className="py-2">1 day ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleAppwriteDashboard;