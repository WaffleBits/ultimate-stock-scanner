import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Watchlist from './components/watchlist/Watchlist';
import StockChart from './components/chart/StockChart';
import MacdScan from './components/scan/MacdScan';
import Auth from './components/auth/Auth';
import UserProfile from './components/user/UserProfile';
import Settings from './components/settings/Settings';
import { getCurrentUser, User } from './services/authService';

function App() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']);
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('chart');

  useEffect(() => {
    // Load current user on component mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const handleScanComplete = (results: string[]) => {
    setScanResults(results);
  };

  const handleAuthChange = (user: User | null) => {
    setUser(user);
  };

  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white">
        <header className="bg-gray-800 p-4 shadow-md">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold mb-3 md:mb-0">
              <span className="text-purple-400">Ultimate</span> Stock Scanner
            </h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link 
                    to="/" 
                    className={`px-3 py-2 rounded ${activeTab === 'chart' ? 'bg-purple-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('chart')}
                  >
                    Charts
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/scan" 
                    className={`px-3 py-2 rounded ${activeTab === 'scan' ? 'bg-purple-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('scan')}
                  >
                    Scan
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/settings" 
                    className={`px-3 py-2 rounded ${activeTab === 'settings' ? 'bg-purple-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded ${activeTab === 'profile' ? 'bg-purple-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    {user ? user.username : 'Login'}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <div className="container mx-auto py-6 px-4 flex flex-col md:flex-row">
          <aside className="w-full md:w-72 mb-6 md:mb-0 md:mr-6">
            <Watchlist 
              watchlist={watchlist} 
              onStockSelect={handleStockSelect} 
              onWatchlistChange={setWatchlist}
              highlightedStocks={scanResults}
            />
          </aside>

          <main className="flex-grow">
            <Routes>
              <Route 
                path="/" 
                element={
                  <StockChart 
                    symbol={selectedStock || 'AAPL'} 
                    data={[]} // StockChart will fetch its own data
                  />
                } 
              />
              <Route 
                path="/scan" 
                element={
                  <MacdScan 
                    watchlist={watchlist} 
                    onScanComplete={handleScanComplete} 
                  />
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Settings />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  user ? (
                    <UserProfile />
                  ) : (
                    <Auth onAuthChange={handleAuthChange} />
                  )
                } 
              />
            </Routes>
          </main>
        </div>

        <footer className="bg-gray-800 p-4 mt-auto">
          <div className="container mx-auto text-sm text-gray-400 text-center">
            <p>Ultimate Stock Scanner &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
