import React, { useState, useEffect } from 'react';
import ApiService from '../services/api-service';
import { User, Users, Clock, Activity } from 'lucide-react';

const SimpleAppwriteDashboard = () => {
  const [userData, setUserData] = useState({
    userCount: 0,
    newUsers: 0,
    recentUsers: [],
    sessionCount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats from our backend API
        const stats = await ApiService.getDashboardStats();
        const recentUsers = await ApiService.getRecentUsers(5);
        
        setUserData({
          userCount: stats.totalUsers,
          newUsers: stats.newUsers,
          recentUsers,
          sessionCount: stats.activeSessions,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUserData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load data from server'
        }));
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (userData.loading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">Loading user data...</div>
      </div>
    );
  }

  // Error state
  if (userData.error) {
    return (
      <div className="p-4 bg-white rounded shadow border-l-4 border-red-500">
        <div className="flex items-center">
          <div className="text-red-500 mr-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{userData.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Appwrite User Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-blue-600">Total Users</p>
            <p className="text-xl font-bold">{userData.userCount.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <User className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-green-600">New Users (24h)</p>
            <p className="text-xl font-bold">{userData.newUsers.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <Activity className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-purple-600">Active Sessions</p>
            <p className="text-xl font-bold">{userData.sessionCount.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-yellow-600">Sessions per User</p>
            <p className="text-xl font-bold">
              {userData.userCount > 0 ? (userData.sessionCount / userData.userCount).toFixed(2) : '0'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent Users */}
      <div>
        <h3 className="font-bold text-lg mb-4">Recent Users</h3>
        
        {userData.recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userData.recentUsers.map(user => (
                  <tr key={user.$id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.$id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.$createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No users found</p>
        )}
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <p>
          <span className="font-bold">Note:</span> This dashboard fetches data from a secure backend server that communicates with Appwrite.
        </p>
      </div>
    </div>
  );
};

export default SimpleAppwriteDashboard;