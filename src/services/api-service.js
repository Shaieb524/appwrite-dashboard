// API service for communicating with our backend server
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ApiService = {
  // User methods
  getUserCount: async () => {
    try {
      const response = await fetch(`${API_URL}/users/count`);
      if (!response.ok) throw new Error('Failed to fetch user count');
      const data = await response.json();
      return data.total;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  },

  getRecentUsers: async (limit = 10) => {
    try {
      const response = await fetch(`${API_URL}/users/recent?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch recent users');
      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Error getting recent users:', error);
      return [];
    }
  },

  getUsersOverTime: async (days = 30) => {
    try {
      const response = await fetch(`${API_URL}/users/growth?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch user growth data');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting users over time:', error);
      return [];
    }
  },

  // Session methods
  getActiveSessions: async () => {
    try {
      const response = await fetch(`${API_URL}/sessions/active`);
      if (!response.ok) throw new Error('Failed to fetch active sessions');
      return await response.json();
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return { sessions: [], total: 0 };
    }
  },

  getSessionCount: async () => {
    try {
      const response = await fetch(`${API_URL}/sessions/active`);
      if (!response.ok) throw new Error('Failed to fetch session count');
      const data = await response.json();
      return data.total || 0;
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  },

  getSessionsByDevice: async () => {
    try {
      const response = await fetch(`${API_URL}/sessions/by-device`);
      if (!response.ok) throw new Error('Failed to fetch sessions by device');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting sessions by device:', error);
      return [];
    }
  },
  
  getSessionsByLocation: async () => {
    try {
      const response = await fetch(`${API_URL}/sessions/by-location`);
      if (!response.ok) throw new Error('Failed to fetch sessions by location');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting sessions by location:', error);
      return [];
    }
  },
  
  getSessionsByTime: async () => {
    try {
      const response = await fetch(`${API_URL}/sessions/by-time`);
      if (!response.ok) throw new Error('Failed to fetch sessions by time');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting sessions by time:', error);
      return [];
    }
  },
  
  getSessionDetails: async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/sessions/details/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session details');
      return await response.json();
    } catch (error) {
      console.error(`Error getting details for session ${sessionId}:`, error);
      return null;
    }
  },

  // Dashboard methods
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return await response.json();
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

export default ApiService;