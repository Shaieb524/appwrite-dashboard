const { Query, ID } = require('node-appwrite');
const { users, account, teams, databases, locale } = require('../config/appwrite-config');
const UAParser = require('ua-parser-js'); // You'll need to install this: npm install ua-parser-js

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
            const parser = new UAParser(session.userAgent);
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
      throw error;
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
            const parser = new UAParser(session.userAgent);
            const browserInfo = parser.getBrowser();
            const osInfo = parser.getOS();
            const deviceInfo = parser.getDevice();
            
            // Calculate session duration
            const startTime = new Date(session.$createdAt);
            const lastActive = new Date(session.expire); // expire time is when session will end
            const durationMs = lastActive - startTime;
            const durationMinutes = Math.floor(durationMs / (1000 * 60));
            
            // Try to get country information
            let locationInfo = 'Unknown Location';
            try {
              // Try to get country from IP using a service like ipinfo.io or Appwrite's locale service
              const ipInfo = await locale.getCountries();
              const countryName = ipInfo.find(c => c.ip === session.ip)?.name || 'Unknown Country';
              locationInfo = countryName;
            } catch (locError) {
              console.error('Error getting location info:', locError);
            }
            
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
              location: locationInfo,
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
      const [userCount, sessionsData, recentUsers] = await Promise.all([
        AppwriteService.getUserCount(),
        AppwriteService.getActiveSessions(),
        AppwriteService.getRecentUsers(30)
      ]);
      
      const sessionCount = sessionsData.total;
      
      // Calculate new users in the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const newUsers = recentUsers.filter(
        user => new Date(user.$createdAt) > oneDayAgo
      ).length;
      
      // Calculate growth rates using actual data if you have historical data stored
      // For now, we'll use estimates based on available data
      const userGrowth = newUsers > 0 ? ((newUsers / userCount) * 100).toFixed(1) : 0;
      const sessionGrowth = sessionCount > 0 ? ((sessionCount / userCount) * 100).toFixed(1) : 0;
      
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
      
      // Group sessions by device type
      const deviceCounts = {};
      sessions.forEach(session => {
        const parser = new UAParser(session.userAgent);
        const deviceInfo = parser.getDevice();
        const deviceType = deviceInfo.type || 'Desktop'; // Default to desktop if not specified
        
        // Map device types to broader categories
        let category = 'Other';
        if (deviceType.toLowerCase().includes('mobile')) category = 'Mobile';
        else if (deviceType.toLowerCase().includes('tablet')) category = 'Tablet';
        else if (deviceType.toLowerCase().includes('desktop')) category = 'Desktop';
        
        deviceCounts[category] = (deviceCounts[category] || 0) + 1;
      });
      
      // Convert to array format for charts
      return Object.entries(deviceCounts).map(([name, value]) => ({
        name,
        value
      }));
    } catch (error) {
      console.error('Error getting sessions by device:', error);
      // Fallback to empty data
      return [];
    }
  },
  
  getSessionsByLocation: async () => {
    try {
      const sessionsData = await AppwriteService.getActiveSessions();
      const sessions = sessionsData.sessions;
      
      // Group sessions by location (country)
      // Note: In a real implementation, you'd use GeoIP or similar service with the IPs
      const locationCounts = {};
      sessions.forEach(session => {
        // In a real implementation, you'd get country from IP
        // For now, we'll use a placeholder
        const location = 'Unknown'; 
        
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      
      // Convert to array format for charts
      return Object.entries(locationCounts).map(([name, value]) => ({
        name,
        value
      }));
    } catch (error) {
      console.error('Error getting sessions by location:', error);
      // Fallback to empty data
      return [];
    }
  },
  
  getSessionsByTime: async () => {
    try {
      const sessionsData = await AppwriteService.getActiveSessions();
      const sessions = sessionsData.sessions;
      
      // Group sessions by hour of day
      const hourCounts = {};
      for (let i = 0; i < 24; i += 3) {
        const hourString = `${i.toString().padStart(2, '0')}:00`;
        hourCounts[hourString] = 0;
      }
      
      sessions.forEach(session => {
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
      // Fallback to empty data
      return [];
    }
  }
};

module.exports = AppwriteService;