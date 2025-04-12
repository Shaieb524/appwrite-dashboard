import { serverAccount, serverUsers } from '../utils/appwrite-config';
import { Query } from 'appwrite';

// Service to handle Appwrite API calls
const AppwriteService = {
  // User Account Methods
  getCurrentUser: async () => {
    try {
      return await serverAccount.get();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  getUserCount: async () => {
    try {
      // Get total user count
      const response = await serverUsers.list();
      return response.total;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  },

  getRecentUsers: async (limit = 10) => {
    try {
      // Get recent users, ordered by creation date
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];
      const response = await serverUsers.list(queries);
      return response.users;
    } catch (error) {
      console.error('Error getting recent users:', error);
      return [];
    }
  },

  getUsersOverTime: async (days = 30) => {
    try {
      // Calculate date from X days ago
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get users created since startDate
      const queries = [
        Query.greaterThan('$createdAt', startDate.toISOString()),
        Query.orderAsc('$createdAt'),
        Query.limit(100) // Adjust limit as needed
      ];
      const response = await serverUsers.list(queries);
      
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
      return [];
    }
  },

  // Session Methods
  getActiveSessions: async () => {
    try {
      const response = await serverAccount.listSessions();
      return response.sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  },
  
  getSessionCount: async () => {
    try {
      // For session count, we'll use a different approach
      // This is just an estimate based on active sessions
      const response = await serverAccount.listSessions();
      return response.total || response.sessions.length;
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  },

  getSessionsByDevice: async () => {
    try {
      const response = await serverAccount.listSessions();
      const sessions = response.sessions || [];
      
      // Process data to categorize by device type
      const deviceCounts = {
        Mobile: 0,
        Desktop: 0, 
        Tablet: 0,
        Other: 0
      };
      
      sessions.forEach(session => {
        if (!session.userAgent) {
          deviceCounts.Other++;
          return;
        }
        
        const userAgent = session.userAgent.toLowerCase();
        
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
          deviceCounts.Mobile++;
        } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
          deviceCounts.Tablet++;
        } else {
          deviceCounts.Desktop++;
        }
      });
      
      return Object.entries(deviceCounts).map(([name, value]) => ({
        name,
        value
      }));
    } catch (error) {
      console.error('Error getting sessions by device:', error);
      return [];
    }
  },

  // Dashboard Overview Methods
  getDashboardStats: async () => {
    try {
      // Get current counts
      const [userCount, activeSessions, recentUsers] = await Promise.all([
        AppwriteService.getUserCount(),
        AppwriteService.getActiveSessions(),
        AppwriteService.getRecentUsers(30)
      ]);
      
      // Calculate new users in the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const newUsers = recentUsers.filter(
        user => new Date(user.$createdAt) > oneDayAgo
      ).length;
      
      // You would need historical data to calculate growth percentages
      // This is simplified for the example
      const userGrowth = 8.5;  // This would be calculated from historical data
      const sessionGrowth = 12.3;  // This would be calculated from historical data
      
      return {
        totalUsers: userCount,
        activeSessions: activeSessions.length || 0,
        newUsers,
        userGrowth,
        sessionGrowth
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalUsers: 0,
        activeSessions: 0,
        newUsers: 0,
        userGrowth: 0,
        sessionGrowth: 0
      };
    }
  }
};

export default AppwriteService;