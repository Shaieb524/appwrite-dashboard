// App.js
import React, { useState } from 'react';
import SimpleAppwriteDashboard from './components/SimpleAppwriteDashboard';
import SessionsDetailView from './components/SessionsDetailView';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'sessions'
  
  return (
    <div className="App bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Appwrite Dashboard</h1>
              </div>
              <nav className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeView === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('sessions')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeView === 'sessions'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Sessions
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' ? (
          <SimpleAppwriteDashboard />
        ) : (
          <SessionsDetailView />
        )}
      </div>
    </div>
  );
}

export default App;