const { Query } = require('node-appwrite');
const { users, account, databases, teams, functions, avatars, locale } = require('../config/appwrite-config');
const UAParser = require('ua-parser-js');

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
      // Get all users first
      const usersResponse = await users.list([
        Query.limit(100) // Adjust based on your needs
      ]);
      
      // For each user, get their sessions from Appwrite
      const sessionsPromises = usersResponse.users.map(async (user) => {
        try {
          // Get user sessions - we need to fetch this for each user
          // Note: Using users.listSessions() to get real session data
          const userSessions = await users.listSessions(user.$id);
          
          // Map each session to our desired format
          return userSessions.sessions.map(session => {
            // Parse user agent for device and browser info
            const parser = new UAParser(session.userAgent || '');
            const browserInfo = parser.getBrowser();
            const osInfo = parser.getOS();
            const deviceInfo = parser.getDevice();
            
            // Calculate session duration
            const startTime = new Date(session.$createdAt);
            const lastActive = new Date(session.expire); // expire time is when session will end
            const durationMs = lastActive - startTime;
            const durationMinutes = Math.floor(durationMs / (1000 * 60));

            return {
              id: session.$id,
              userId: user.$id,
              userEmail: user.email,
              userName: user.name,
              device: deviceInfo.vendor ? `${deviceInfo.vendor} ${deviceInfo.model}` : 
                     (osInfo.name ? osInfo.name : 'Unknown Device'),
              browser: browserInfo.name ? `${browserInfo.name} ${browserInfo.version}` : 'Unknown Browser',
              os: osInfo.name ? `${osInfo.name} ${osInfo.version}` : 'Unknown OS',
              ip: session.ip,
              location: 'Location data not available', // Appwrite doesn't provide this directly
              startTime: session.$createdAt,
              lastActive: session.expire, // Using expire date as last active
              duration: `${durationMinutes} minutes`,
              active: new Date() < new Date(session.expire), // Session is active if not expired
              provider: session.provider,
              current: session.current
            };
          });
        } catch (error) {
          console.error(`Error getting sessions for user ${user.$id}:`, error);
          return [];
        }
      });
      
      // Wait for all session requests to complete
      const sessionsArrays = await Promise.all(sessionsPromises);
      
      // Flatten the array of arrays into a single array of sessions
      const allSessions = sessionsArrays.flat();
      
      return {
        sessions: allSessions,
        total: allSessions.length
      };
    } catch (error) {
      console.error('Error getting active sessions:', error);
      // If there's an error, return an empty array rather than crashing
      return {
        sessions: [],
        total: 0
      };
    }
  },
  
  getSessionDetails: async (sessionId) => {
    try {
      // First, we need to find which user this session belongs to
      // Get a list of users
      const usersResponse = await users.list([
        Query.limit(100) // Adjust based on your needs
      ]);
      
      // For each user, check their sessions
      for (const user of usersResponse.users) {
        try {
          const userSessions = await users.listSessions(user.$id);
          const session = userSessions.sessions.find(s => s.$id === sessionId);
          
          if (session) {
            // Found the session, now we can return detailed information
            const parser = new UAParser(session.userAgent || '');
            const browserInfo = parser.getBrowser();
            const osInfo = parser.getOS();
            const deviceInfo = parser.getDevice();
            
            // Calculate session duration
            const startTime = new Date(session.$createdAt);
            const lastActive = new Date(session.expire); // expire time is when session will end
            const durationMs = lastActive - startTime;
            const durationMinutes = Math.floor(durationMs / (1000 * 60));
            
            // In a real implementation, you'd track user actions in your own database
            // Here we'll return some placeholder actions based on the session data
            const actions = [
              { type: 'login', timestamp: session.$createdAt },
              // Add more actions if you have them tracked somewhere
            ];
            
            return {
              id: session.$id,
              userId: user.$id,
              userEmail: user.email,
              userName: user.name,
              device: deviceInfo.vendor ? `${deviceInfo.vendor} ${deviceInfo.model}` : 
                     (osInfo.name ? osInfo.name : 'Unknown Device'),
              browser: browserInfo.name ? `${browserInfo.name} ${browserInfo.version}` : 'Unknown Browser',
              os: osInfo.name ? `${osInfo.name} ${osInfo.version}` : 'Unknown OS',
              ip: session.ip,
              location: 'Unknown Location', // Appwrite doesn't provide this directly
              startTime: session.$createdAt,
              lastActive: session.expire, // Using expire date as last active
              duration: `${durationMinutes} minutes`,
              active: new Date() < new Date(session.expire), // Session is active if not expired
              userAgent: session.userAgent,
              provider: session.provider,
              current: session.current,
              actions: actions
            };
          }
        } catch (error) {
          console.error(`Error checking sessions for user ${user.$id}:`, error);
        }
      }
      
      throw new Error(`Session not found: ${sessionId}`);
    } catch (error) {
      console.error('Error getting session details:', error);
      throw error;
    }
  },

  // Dashboard stats
  getDashboardStats: async () => {
    try {
      // Get current counts using real data
      const userCount = await AppwriteService.getUserCount();
      let sessionCount = 0;
      let recentUsers = [];
      
      try {
        const sessionsData = await AppwriteService.getActiveSessions();
        sessionCount = sessionsData.total;
        recentUsers = await AppwriteService.getRecentUsers(30);
      } catch (error) {
        console.error('Error getting session data for dashboard:', error);
      }
      
      // Calculate new users in the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const newUsers = recentUsers.filter(
        user => new Date(user.$createdAt) > oneDayAgo
      ).length || 0;
      
      // Calculate growth rates using actual data if you have historical data stored
      // For now, we'll use estimates based on available data
      const userGrowth = newUsers > 0 && userCount > 0 ? ((newUsers / userCount) * 100).toFixed(1) : 0;
      const sessionGrowth = sessionCount > 0 && userCount > 0 ? ((sessionCount / userCount) * 100).toFixed(1) : 0;
      
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
    try {
      const sessionsData = await AppwriteService.getActiveSessions();
      const sessions = sessionsData.sessions;
      
      // Check if we have sessions data
      if (!sessions || sessions.length === 0) {
        // Return default data if no sessions
        return [
          { name: 'Desktop', value: 1 }
        ];
      }
      
      // Group sessions by device type
      const deviceCounts = {
        'Desktop': 0,
        'Mobile': 0,
        'Tablet': 0,
        'Other': 0
      };
      
      sessions.forEach(session => {
        if (!session.userAgent) {
          deviceCounts['Other']++;
          return;
        }
        
        const parser = new UAParser(session.userAgent);
        const deviceInfo = parser.getDevice();
        const deviceType = deviceInfo.type || 'unknown';
        
        // Map device types to broader categories
        if (deviceType.toLowerCase().includes('mobile')) {
          deviceCounts['Mobile']++;
        } else if (deviceType.toLowerCase().includes('tablet')) {
          deviceCounts['Tablet']++;
        } else if (deviceType === 'unknown') {
          deviceCounts['Desktop']++; // Most unknown are desktop browsers
        } else {
          deviceCounts['Other']++;
        }
      });
      
      // Convert to array format for charts, filtering out zero values
      return Object.entries(deviceCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value
        }));
    } catch (error) {
      console.error('Error getting sessions by device:', error);
      // Fallback to empty data
      return [
        { name: 'Desktop', value: 1 }
      ];
    }
  },
  
  getSessionsByLocation: async () => {
    try {
      const sessionsData = await AppwriteService.getActiveSessions();
      const sessions = sessionsData.sessions;
      
      // Check if we have sessions data
      if (!sessions || sessions.length === 0) {
        // Return default data if no sessions
        return [
          { name: 'Unknown', value: 1 }
        ];
      }
      
      // Group sessions by IP (since we don't have real location data)
      const locationCounts = {};
      
      sessions.forEach(session => {
        const ip = session.ip || 'Unknown';
        locationCounts[ip] = (locationCounts[ip] || 0) + 1;
      });
      
      // Convert to array format for charts
      return Object.entries(locationCounts).map(([name, value]) => ({
        name,
        value
      }));
    } catch (error) {
      console.error('Error getting sessions by location:', error);
      // Fallback to empty data
      return [
        { name: 'Unknown', value: 1 }
      ];
    }
  },
  
  getSessionsByTime: async () => {
    try {
      const sessionsData = await AppwriteService.getActiveSessions();
      const sessions = sessionsData.sessions;
      
      // Check if we have sessions data
      if (!sessions || sessions.length === 0) {
        // Return default data structure if no sessions
        return Array.from({ length: 8 }, (_, i) => ({
          time: `${(i * 3).toString().padStart(2, '0')}:00`,
          sessions: 0
        }));
      }
      
      // Group sessions by hour of day
      const hourCounts = {};
      for (let i = 0; i < 24; i += 3) {
        const hourString = `${i.toString().padStart(2, '0')}:00`;
        hourCounts[hourString] = 0;
      }
      
      sessions.forEach(session => {
        if (!session.startTime) return;
        
        const hour = new Date(session.startTime).getHours();
        // Round down to nearest 3-hour block
        const blockHour = Math.floor(hour / 3) * 3;
        const hourString = `${blockHour.toString().padStart(2, '0')}:00`;
        
        hourCounts[hourString] = (hourCounts[hourString] || 0) + 1;
      });
      
      // Convert to array format for charts
      return Object.entries(hourCounts).map(([time, sessions]) => ({
        time,
        sessions
      }));
    } catch (error) {
      console.error('Error getting sessions by time:', error);
      // Fallback to empty data with time structure
      return Array.from({ length: 8 }, (_, i) => ({
        time: `${(i * 3).toString().padStart(2, '0')}:00`,
        sessions: 0
      }));
    }
  }
};

module.exports = AppwriteService;