import React, { useState, useEffect } from 'react';
import Watchlist from '../components/watchlist/Watchlist';
import StockChart from '../components/chart/StockChart';
import MacdScan from '../components/scan/MacdScan';
import { getMockCandleData, CandleData } from '../services/stockApi';

const MainPage: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [candleData, setCandleData] = useState<CandleData | null>(null);
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'scan'>('chart');

  // Fetch candle data for the selected symbol
  useEffect(() => {
    if (!selectedSymbol) return;

    // In a real app, you would fetch actual data from an API
    // For demo purposes, we'll use mock data
    const data = getMockCandleData(90); // 90 days of data
    setCandleData(data);
  }, [selectedSymbol]);

  // Handle stock selection from watchlist
  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('chart'); // Switch to chart tab when selecting a stock
  };

  // Handle scan completion
  const handleScanComplete = (results: string[]) => {
    setScanResults(results);
    setActiveTab('scan'); // Switch to scan tab when scan completes
  };

  // Handle running a scan on the watchlist
  const handleScanWatchlist = (symbols: string[]) => {
    setActiveTab('scan'); // Switch to scan tab
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar with watchlist */}
      <div className="w-64 border-r border-gray-700">
        <Watchlist 
          onSelectStock={handleSelectStock} 
          onScanWatchlist={handleScanWatchlist} 
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Ultimate Stock Scanner</h1>
          <p className="text-gray-400">
            Select a stock from your watchlist to view charts and run scans
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'chart'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('chart')}
          >
            Chart
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'scan'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('scan')}
          >
            Scan
          </button>
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === 'chart' && candleData && (
            <StockChart 
              symbol={selectedSymbol} 
              data={candleData} 
            />
          )}
          
          {activeTab === 'scan' && (
            <MacdScan 
              watchlist={scanResults.length > 0 ? scanResults : [selectedSymbol]} 
              onScanComplete={handleScanComplete} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage; 