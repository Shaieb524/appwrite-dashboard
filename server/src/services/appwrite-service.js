const { Query } = require('node-appwrite');
const { users, account } = require('../config/appwrite-config');

// Service for handling Appwrite interactions
const AppwriteService = {
  // User methods
  getUserCount: async () => {
    try {
      const response = await users.list();
      return response.total;
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  },

  getRecentUsers: async (limit = 10) => {
    try {
      const response = await users.list([
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]);
      return response.users;
    } catch (error) {
      console.error('Error getting recent users:', error);
      throw error;
    }
  },

  getUsersOverTime: async (days = 30) => {
    try {
      // Calculate date from X days ago
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await users.list([
        Query.greaterThan('$createdAt', startDate.toISOString()),
        Query.orderAsc('$createdAt'),
        Query.limit(100)
      ]);
      
      // Process data to get users by date
      const usersByDate = {};
      response.users.forEach(user => {
        const date = new Date(user.$createdAt).toLocaleDateString();
        usersByDate[date] = (usersByDate[date] || 0) + 1;
      });
      
      return Object.entries(usersByDate).map(([date, count]) => ({
        date,
        users: count
      }));
    } catch (error) {
      console.error('Error getting users over time:', error);
      throw error;
    }
  },

  // Session methods
  getActiveSessions: async () => {
    try {
      // Note: This is a server-side endpoint, so it won't return user sessions
      // In a real app, you might need to store session info in your own database
      // This is simplified for the example
      const response = await users.list([Query.limit(1)]);
      return {
        sessions: [],
        total: 0
      };
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  },

  // Dashboard stats
  getDashboardStats: async () => {
    try {
      // Get current counts
      const [userCount, recentUsers] = await Promise.all([
        AppwriteService.getUserCount(),
        AppwriteService.getRecentUsers(30)
      ]);
      
      // Calculate new users in the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const newUsers = recentUsers.filter(
        user => new Date(user.$createdAt) > oneDayAgo
      ).length;
      
      // Mock session data (in a real app, you'd get this from your database)
      const sessionCount = Math.floor(userCount * 1.5);
      const userGrowth = 8.5;  // Example value
      const sessionGrowth = 12.3;  // Example value
      
      return {
        totalUsers: userCount,
        activeSessions: sessionCount,
        newUsers,
        userGrowth,
        sessionGrowth
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  getSessionsByDevice: async () => {
    // Mock data for session distribution by device
    // In a real app, you'd get this from your database
    return [
      { name: 'Mobile', value: 45 },
      { name: 'Desktop', value: 35 },
      { name: 'Tablet', value: 15 },
      { name: 'Other', value: 5 }
    ];
  }
};

module.exports = AppwriteService;