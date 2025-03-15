import React, { useState, useRef } from 'react';
import { 
  scanMACDPink, 
  scanMACDPinkBelowZero, 
  scanCombo, 
  scanUltimate 
} from '../../utils/indicators';
import { getBatchCandleData } from '../../services/stockApi';
import { parseTradingViewWatchlist, readFileAsText } from '../../services/watchlistService';
import { sendScanResultsAlert } from '../../services/alertService';
import { getApiKey } from '../../services/stockApi';

interface MacdScanProps {
  watchlist: string[];
  onScanComplete: (results: string[]) => void;
}

type ScanType = 'macd' | 'macdBelowZero' | 'combo' | 'ultimate';

const MacdScan: React.FC<MacdScanProps> = ({ watchlist, onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [selectedScanType, setSelectedScanType] = useState<ScanType>('macd');
  const [uploadedWatchlist, setUploadedWatchlist] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await readFileAsText(file);
      const symbols = parseTradingViewWatchlist(fileContent);
      setUploadedWatchlist(symbols);
      alert(`Successfully loaded ${symbols.length} symbols from the watchlist file`);
    } catch (error) {
      console.error('Error reading watchlist file:', error);
      alert('Error reading watchlist file. Please make sure it is a valid TradingView watchlist.');
    }
  };

  // Run scan based on selected type
  const runScan = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError("API key not configured. Please set your Finnhub API key in settings.");
      return;
    }
    
    const symbolsToScan = uploadedWatchlist.length > 0 ? uploadedWatchlist : watchlist;
    
    if (symbolsToScan.length === 0) {
      alert('Please add stocks to your watchlist or upload a watchlist file');
      return;
    }

    setIsScanning(true);
    setScanResults([]);
    setError(null);

    try {
      // Get real market data for each stock
      const candleData = await getBatchCandleData(symbolsToScan, 'D', 100);
      
      let results: string[] = [];
      
      const stocksData = Object.entries(candleData).map(([symbol, data]) => ({
        symbol,
        close: data.close,
        high: data.high,
        low: data.low
      }));

      // Run the selected scan
      let scanName = '';
      switch (selectedScanType) {
        case 'macd':
          results = scanMACDPink(stocksData);
          scanName = 'MACD';
          break;
        case 'macdBelowZero':
          results = scanMACDPinkBelowZero(stocksData);
          scanName = 'MACD Below Zero';
          break;
        case 'combo':
          results = scanCombo(stocksData);
          scanName = 'Combo';
          break;
        case 'ultimate':
          results = scanUltimate(stocksData);
          scanName = 'Ultimate';
          break;
      }

      setScanResults(results);
      onScanComplete(results);
      
      // Send Discord alert if enabled
      await sendScanResultsAlert(scanName, results, symbolsToScan.length);
    } catch (error) {
      console.error('Error running scan:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while running scan. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Get scan description based on selected type
  const getScanDescription = (): string => {
    switch (selectedScanType) {
      case 'macd':
        return 'Scans for stocks where the MACD histogram is higher than the previous candle.';
      case 'macdBelowZero':
        return 'Scans for stocks where the MACD histogram is higher than the previous candle but below zero line.';
      case 'combo':
        return 'MACD scan (below zero) plus check if Supertrend is green.';
      case 'ultimate':
        return 'Combo scan plus check if TTM Squeeze histogram is below zero.';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Stock Scanner</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-300 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Watchlist upload section */}
      <div className="mb-6 bg-gray-700 p-3 rounded">
        <h3 className="text-lg font-semibold text-white mb-2">Upload Watchlist</h3>
        <p className="text-gray-300 mb-3 text-sm">
          Upload a TradingView watchlist file to scan multiple symbols at once.
        </p>
        <div className="flex items-center">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 py-2 px-4 rounded text-white hover:bg-blue-700 mr-2"
          >
            Choose File
          </button>
          <span className="text-gray-300 text-sm">
            {uploadedWatchlist.length > 0 
              ? `${uploadedWatchlist.length} symbols loaded` 
              : 'No file selected'}
          </span>
        </div>
      </div>
      
      {/* Scan type selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Scan Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedScanType('macd')}
            className={`py-2 px-3 rounded font-medium text-sm ${
              selectedScanType === 'macd'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            MACD Scan
          </button>
          <button
            onClick={() => setSelectedScanType('macdBelowZero')}
            className={`py-2 px-3 rounded font-medium text-sm ${
              selectedScanType === 'macdBelowZero'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            MACD Below Zero
          </button>
          <button
            onClick={() => setSelectedScanType('combo')}
            className={`py-2 px-3 rounded font-medium text-sm ${
              selectedScanType === 'combo'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Combo Scan
          </button>
          <button
            onClick={() => setSelectedScanType('ultimate')}
            className={`py-2 px-3 rounded font-medium text-sm ${
              selectedScanType === 'ultimate'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Ultimate Scan
          </button>
        </div>
      </div>
      
      {/* Scan description */}
      <p className="text-gray-300 mb-4 text-sm">
        {getScanDescription()}
      </p>
      
      {/* Run scan button */}
      <button
        onClick={runScan}
        disabled={isScanning || (watchlist.length === 0 && uploadedWatchlist.length === 0)}
        className={`w-full py-2 rounded font-bold ${
          isScanning || (watchlist.length === 0 && uploadedWatchlist.length === 0)
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isScanning ? 'Scanning...' : `Run ${selectedScanType === 'macd' ? 'MACD' : selectedScanType === 'macdBelowZero' ? 'MACD Below Zero' : selectedScanType === 'combo' ? 'Combo' : 'Ultimate'} Scan`}
      </button>
      
      {/* Results section */}
      {scanResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-2">Results:</h3>
          <div className="bg-gray-700 rounded p-3 max-h-60 overflow-y-auto">
            {scanResults.length === 0 ? (
              <p className="text-gray-400">No stocks matched the criteria</p>
            ) : (
              <ul className="space-y-1">
                {scanResults.map(symbol => (
                  <li key={symbol} className="text-green-400">
                    {symbol} 
                    {selectedScanType === 'macd' && ' - MACD Histogram is rising'}
                    {selectedScanType === 'macdBelowZero' && ' - MACD Histogram rising & below zero'}
                    {selectedScanType === 'combo' && ' - MACD + Supertrend conditions met'}
                    {selectedScanType === 'ultimate' && ' - All conditions met'}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-2 text-gray-400 text-sm">
            {scanResults.length} of {uploadedWatchlist.length || watchlist.length} stocks matched the criteria
          </p>
          <p className="mt-1 text-gray-400 text-sm italic">
            Discord alert sent with results (if enabled in settings)
          </p>
        </div>
      )}
    </div>
  );
};

export default MacdScan; 