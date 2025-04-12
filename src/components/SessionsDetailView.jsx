import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, Clock, Monitor, Globe, Activity, Search, ChevronDown, ChevronUp, Mail, User } from 'lucide-react';
import ApiService from '../services/api-service';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const SessionsDetailView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState({});

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        
        // Fetch all session data in parallel
        const [activeSessions, byDevice, byLocation, byTime] = await Promise.all([
          ApiService.getActiveSessions(),
          ApiService.getSessionsByDevice(),
          ApiService.getSessionsByLocation(),
          ApiService.getSessionsByTime()
        ]);
        
        setSessions(activeSessions.sessions || []);
        setDeviceData(byDevice || []);
        setLocationData(byLocation || []);
        setTimeData(byTime || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, []);

  const fetchSessionDetails = async (sessionId) => {
    try {
      const details = await ApiService.getSessionDetails(sessionId);
      setSelectedSession(details);
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };
  
  const toggleSessionExpand = (sessionId) => {
    setExpandedSessions(prev => {
      const newState = { ...prev };
      if (newState[sessionId]) {
        delete newState[sessionId];
        setSelectedSession(null);
      } else {
        newState[sessionId] = true;
        fetchSessionDetails(sessionId);
      }
      return newState;
    });
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Session Analytics</h2>
      
      {/* Navigation Tabs */}
      <div className="flex mb-6 border-b">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('active-sessions')}
          className={`py-2 px-4 ${activeTab === 'active-sessions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Active Sessions
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-4 ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Session count card */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Activity className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-blue-600">Active Sessions</p>
                <p className="text-xl font-bold">{sessions.length}</p>
              </div>
            </div>
            
            {/* Device distribution card */}
            <div className="bg-green-50 rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Monitor className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-green-600">Most Used Device</p>
                <p className="text-xl font-bold">
                  {deviceData.length > 0 ? deviceData.reduce((prev, current) => 
                    (prev.value > current.value) ? prev : current).name : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Location card */}
            <div className="bg-purple-50 rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <Globe className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-purple-600">Top Location</p>
                <p className="text-xl font-bold">
                  {locationData.length > 0 ? locationData.reduce((prev, current) => 
                    (prev.value > current.value) ? prev : current).name : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Device distribution chart */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Session Distribution by Device</h3>
              <div className="h-64">
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No device data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Time distribution chart */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Sessions by Time of Day</h3>
              <div className="h-64">
                {timeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No time data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Location distribution chart */}
          <div className="bg-white border rounded-lg p-4 mb-8">
            <h3 className="text-lg font-medium mb-4">Session Distribution by Location</h3>
            <div className="h-64">
              {locationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Sessions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No location data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Active Sessions Tab */}
      {activeTab === 'active-sessions' && (
        <div>
          {/* Search and filters */}
          <div className="mb-4 flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search sessions by email or user ID..."
              />
            </div>
            <select className="ml-4 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
          
          {/* Sessions list */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="grid grid-cols-7 gap-4">
                <div className="col-span-1">User ID</div>
                <div className="col-span-1">User Email</div>
                <div className="col-span-1">Device</div>
                <div className="col-span-1">Location</div>
                <div className="col-span-1">Start Time</div>
                <div className="col-span-1">Last Active</div>
                <div className="col-span-1">Status</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="bg-white">
                    <div 
                      className="px-6 py-4 cursor-pointer hover:bg-gray-50" 
                      onClick={() => toggleSessionExpand(session.id)}
                    >
                      <div className="grid grid-cols-7 gap-4">
                        <div className="col-span-1 font-medium text-gray-900 truncate">
                          {session.userId}
                        </div>
                        <div className="col-span-1 truncate text-blue-600">
                          {session.userEmail || 'N/A'}
                        </div>
                        <div className="col-span-1 truncate">{session.device}</div>
                        <div className="col-span-1 truncate">{session.location}</div>
                        <div className="col-span-1 truncate">{new Date(session.startTime).toLocaleString()}</div>
                        <div className="col-span-1 truncate">{new Date(session.lastActive).toLocaleString()}</div>
                        <div className="col-span-1 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.active ? 'Active' : 'Inactive'}
                          </span>
                          {expandedSessions[session.id] ? 
                            <ChevronUp size={16} className="ml-2" /> : 
                            <ChevronDown size={16} className="ml-2" />
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded session details */}
                    {expandedSessions[session.id] && selectedSession && (
                      <div className="px-6 py-4 bg-gray-50 border-t">
                        <h4 className="text-lg font-medium mb-3">Session Details</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-2">User Information</h5>
                            <ul className="space-y-1">
                              <li className="flex items-center">
                                <User size={16} className="mr-2 text-gray-500" />
                                <span className="font-medium mr-2">ID:</span> {selectedSession.userId}
                              </li>
                              <li className="flex items-center">
                                <Mail size={16} className="mr-2 text-gray-500" />
                                <span className="font-medium mr-2">Email:</span> {selectedSession.userEmail || 'N/A'}
                              </li>
                              {selectedSession.userName && (
                                <li className="flex items-center">
                                  <span className="font-medium mr-2 ml-6">Name:</span> {selectedSession.userName}
                                </li>
                              )}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-2">Device Information</h5>
                            <ul className="space-y-1">
                              <li className="flex items-center">
                                <span className="font-medium mr-2">Device:</span> {selectedSession.device}
                              </li>
                              <li className="flex items-center">
                                <span className="font-medium mr-2">Browser:</span> {selectedSession.browser}
                              </li>
                              <li className="flex items-center">
                                <span className="font-medium mr-2">OS:</span> {selectedSession.os}
                              </li>
                              <li className="flex items-center">
                                <span className="font-medium mr-2">IP Address:</span> {selectedSession.ip}
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-2">Timing Information</h5>
                            <ul className="space-y-1">
                              <li className="flex items-center">
                                <span className="font-medium mr-2">Started:</span> 
                                {new Date(selectedSession.startTime).toLocaleString()}
                              </li>
                              <li className="flex items-center">
                                <span className="font-medium mr-2">Last Active:</span> 
                                {new Date(selectedSession.lastActive).toLocaleString()}
                              </li>
                              <li className="flex items-center">
                                <span className="font-medium mr-2">Duration:</span> {selectedSession.duration}
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        {/* User Actions Timeline */}
                        {selectedSession.actions && selectedSession.actions.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-2">Activity Timeline</h5>
                            <div className="relative border-l-2 border-blue-200 ml-3 pl-6 pb-2">
                              {selectedSession.actions.map((action, index) => (
                                <div key={index} className="mb-4 relative">
                                  <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-blue-500"></div>
                                  <div>
                                    <p className="font-medium">{action.type === 'login' ? 'User Login' : 
                                      action.type === 'page_view' ? `Page View: ${action.page}` : 
                                      action.type === 'api_call' ? `API Request: ${action.endpoint}` : 
                                      action.type}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(action.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">No active sessions found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Average Session Duration</h3>
              <p className="text-3xl font-bold text-blue-600">24 min</p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Sessions Per User</h3>
              <p className="text-3xl font-bold text-green-600">1.8</p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Bounce Rate</h3>
              <p className="text-3xl font-bold text-yellow-600">21%</p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Peak Hour</h3>
              <p className="text-3xl font-bold text-purple-600">18:00</p>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4 mb-8">
            <h3 className="text-lg font-medium mb-4">Session Duration Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { duration: '0-5 min', count: 120 },
                    { duration: '5-15 min', count: 95 },
                    { duration: '15-30 min', count: 75 },
                    { duration: '30-60 min', count: 45 },
                    { duration: '60+ min', count: 30 }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="duration" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Sessions" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsDetailView;