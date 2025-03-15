import React, { useState, useEffect } from 'react';
import { getStockQuote, StockData, getMockStockData } from '../../services/stockApi';
import WatchlistItem from './WatchlistItem';

interface WatchlistProps {
  watchlist: string[];
  onStockSelect: (symbol: string) => void;
  onWatchlistChange: (watchlist: string[]) => void;
  highlightedStocks?: string[];
}

const Watchlist: React.FC<WatchlistProps> = ({ 
  watchlist, 
  onStockSelect, 
  onWatchlistChange, 
  highlightedStocks = []
}) => {
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [newSymbol, setNewSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch stock data for watchlist items
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      const newStockData: Record<string, StockData> = {};
      
      for (const symbol of watchlist) {
        try {
          // Use mock data for demo or if API key is not set
          // In a real app, you would use: const data = await getStockQuote(symbol);
          const data = getMockStockData(symbol);
          newStockData[symbol] = data;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
        }
      }
      
      setStockData(newStockData);
      setIsLoading(false);
    };

    if (watchlist.length > 0) {
      fetchStockData();
    }
  }, [watchlist]);

  // Add a new symbol to the watchlist
  const handleAddSymbol = () => {
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      const updatedWatchlist = [...watchlist, newSymbol.toUpperCase()];
      onWatchlistChange(updatedWatchlist);
      setNewSymbol('');
    }
  };

  // Remove a symbol from the watchlist
  const handleRemoveSymbol = (symbol: string) => {
    const updatedWatchlist = watchlist.filter(s => s !== symbol);
    onWatchlistChange(updatedWatchlist);
  };

  // Import watchlist from TradingView (placeholder function)
  const handleImportFromTradingView = () => {
    // In a real app, this would open a dialog to import from TradingView
    alert('This feature would allow importing from TradingView in a real app.');
    
    // For demo purposes, add some sample stocks
    const tradingViewWatchlist = ['TSLA', 'NFLX', 'NVDA', 'AMD', 'INTC'];
    const combinedWatchlist = [...new Set([...watchlist, ...tradingViewWatchlist])];
    onWatchlistChange(combinedWatchlist);
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Watchlist</h2>
      
      {/* Add symbol form */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Add symbol..."
          className="flex-1 px-2 py-1 bg-gray-700 rounded-l text-white"
        />
        <button 
          onClick={handleAddSymbol}
          className="bg-blue-600 px-3 py-1 rounded-r hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      
      {/* Import button */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={handleImportFromTradingView}
          className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700 flex-1"
        >
          Import TV
        </button>
      </div>
      
      {/* Watchlist items */}
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : watchlist.length === 0 ? (
          <p className="text-gray-400">No stocks in watchlist</p>
        ) : (
          watchlist.map(symbol => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              data={stockData[symbol]}
              onSelect={() => onStockSelect(symbol)}
              onRemove={() => handleRemoveSymbol(symbol)}
              isHighlighted={highlightedStocks.includes(symbol)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Watchlist; 