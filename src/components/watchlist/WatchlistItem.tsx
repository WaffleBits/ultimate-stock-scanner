import React from 'react';
import { StockData } from '../../services/stockApi';

interface WatchlistItemProps {
  symbol: string;
  data?: StockData;
  onSelect: () => void;
  onRemove: () => void;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({ 
  symbol, 
  data, 
  onSelect, 
  onRemove 
}) => {
  // Default values if data is not available
  const price = data?.price ?? 0;
  const change = data?.change ?? 0;
  const percentChange = data?.percentChange ?? 0;
  
  // Determine color based on price change
  const changeColor = change >= 0 ? 'text-green-500' : 'text-red-500';
  
  return (
    <div 
      className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex flex-col">
        <span className="font-bold">{symbol}</span>
        <span className={changeColor}>
          ${price.toFixed(2)} {change >= 0 ? '▲' : '▼'} {Math.abs(percentChange).toFixed(2)}%
        </span>
      </div>
      <button 
        className="text-gray-400 hover:text-red-500"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering onSelect
          onRemove();
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default WatchlistItem; 