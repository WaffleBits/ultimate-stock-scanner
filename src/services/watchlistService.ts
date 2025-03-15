import { parse } from 'papaparse';

/**
 * Parse a TradingView watchlist file
 * TradingView watchlists are usually comma-separated values
 */
export const parseTradingViewWatchlist = (fileContent: string): string[] => {
  // Split by commas
  const symbols = fileContent
    .split(',')
    .map(symbol => {
      // Extract ticker symbols (everything after the last ':' if it exists)
      if (symbol.includes(':')) {
        const parts = symbol.split(':');
        return parts[parts.length - 1];
      }
      return symbol;
    })
    .map(s => s.trim())
    .filter(s => {
      // Remove section headers (those starting with ###)
      return !s.startsWith('###') && s.length > 0;
    })
    .map(s => {
      // Remove any trailing ! (some futures symbols end with !)
      return s.endsWith('!') ? s.slice(0, -1) : s;
    });

  // Remove duplicates
  return [...new Set(symbols)];
};

/**
 * Read a file and return its contents as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}; 