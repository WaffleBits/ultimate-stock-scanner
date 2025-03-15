import axios from 'axios';

// We'll use environment variables for API keys in production
// For now, this can be configured by users
let API_KEY = localStorage.getItem('finnhub_api_key') || '';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance';

// Data source type
export type DataSource = 'finnhub' | 'yahoo';

// Get/set preferred data source
export const getDataSource = (): DataSource => {
  const source = localStorage.getItem('data_source') as DataSource;
  return source || (API_KEY ? 'finnhub' : 'yahoo');
};

export const setDataSource = (source: DataSource): void => {
  localStorage.setItem('data_source', source);
};

// Allow users to update their API key
export const setApiKey = (key: string): void => {
  API_KEY = key;
  localStorage.setItem('finnhub_api_key', key);
};

// Get the current API key
export const getApiKey = (): string => {
  return API_KEY;
};

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

export interface CandleData {
  timestamp: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

// Mock data function for development use
export const getMockStockData = (symbol: string): StockData => {
  // Generate random data for demo purposes
  const randomPrice = Math.round(100 + Math.random() * 900) / 10;
  const randomChange = Math.round((Math.random() * 10 - 5) * 10) / 10;
  const randomPercentChange = Math.round((randomChange / randomPrice) * 1000) / 10;
  
  return {
    symbol,
    price: randomPrice,
    change: randomChange,
    percentChange: randomPercentChange
  };
};

// Fetch stock quote data
export const getStockQuote = async (symbol: string): Promise<StockData> => {
  const dataSource = getDataSource();
  
  try {
    if (dataSource === 'finnhub') {
      if (!API_KEY) {
        throw new Error("API key not configured. Please set your Finnhub API key in settings or switch to Yahoo Finance data source.");
      }
      
      const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol,
          token: API_KEY,
        },
      });
      
      const data: StockQuote = response.data;
      
      return {
        symbol,
        price: data.c,
        change: data.d,
        percentChange: data.dp,
      };
    } else {
      // Use Yahoo Finance API (no key required)
      const response = await axios.get(`${YAHOO_FINANCE_BASE_URL}/spark`, {
        params: {
          symbols: symbol,
          range: '1d',
          interval: '1d',
        },
      });
      
      const quoteData = response.data.spark.result[0];
      const currentPrice = quoteData.response[0].meta.regularMarketPrice;
      const previousClose = quoteData.response[0].meta.previousClose || quoteData.response[0].meta.chartPreviousClose;
      const change = currentPrice - previousClose;
      const percentChange = (change / previousClose) * 100;
      
      return {
        symbol,
        price: currentPrice,
        change,
        percentChange,
      };
    }
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
};

// Fetch historical candle data for charts
export const getStockCandles = async (
  symbol: string,
  resolution: string = 'D', // D for daily, W for weekly, M for monthly
  from: number = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000), // 1 year ago
  to: number = Math.floor(Date.now() / 1000) // Current time
): Promise<CandleData> => {
  const dataSource = getDataSource();
  
  try {
    if (dataSource === 'finnhub') {
      if (!API_KEY) {
        throw new Error("API key not configured. Please set your Finnhub API key in settings or switch to Yahoo Finance data source.");
      }
      
      const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
        params: {
          symbol,
          resolution,
          from,
          to,
          token: API_KEY,
        },
      });
      
      if (response.data.s === 'no_data') {
        throw new Error(`No data available for ${symbol}`);
      }
      
      return response.data;
    } else {
      // Use Yahoo Finance API (no key required)
      // Convert resolution to interval for Yahoo Finance
      let interval = '1d';
      if (resolution === 'W') interval = '1wk';
      if (resolution === 'M') interval = '1mo';
      
      // Convert timestamps to Yahoo Finance format
      const fromDate = new Date(from * 1000);
      const toDate = new Date(to * 1000);
      
      // Calculate range based on time period
      let range = '1y'; // Default to 1 year
      const diffInDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays <= 7) range = '5d';
      else if (diffInDays <= 30) range = '1mo';
      else if (diffInDays <= 90) range = '3mo';
      else if (diffInDays <= 180) range = '6mo';
      else if (diffInDays <= 365) range = '1y';
      else if (diffInDays <= 730) range = '2y';
      else range = '5y';
      
      const response = await axios.get(`${YAHOO_FINANCE_BASE_URL}/chart/${symbol}`, {
        params: {
          range,
          interval,
          includePrePost: false,
        },
      });
      
      const result = response.data.chart.result[0];
      if (!result) {
        throw new Error(`No data available for ${symbol}`);
      }
      
      const timestamps = result.timestamp || [];
      const quote = result.indicators.quote[0] || {};
      
      return {
        timestamp: timestamps.map((ts: number) => ts),
        open: quote.open || [],
        high: quote.high || [],
        low: quote.low || [],
        close: quote.close || [],
        volume: quote.volume || [],
      };
    }
  } catch (error) {
    console.error('Error fetching stock candles:', error);
    throw error;
  }
};

// Search for stocks
export const searchStocks = async (query: string) => {
  const dataSource = getDataSource();
  
  try {
    if (dataSource === 'finnhub') {
      if (!API_KEY) {
        throw new Error("API key not configured. Please set your Finnhub API key in settings or switch to Yahoo Finance data source.");
      }
      
      const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
        params: {
          q: query,
          token: API_KEY,
        },
      });
      
      return response.data.result;
    } else {
      // Use Yahoo Finance API (no key required)
      const response = await axios.get('https://query2.finance.yahoo.com/v1/finance/search', {
        params: {
          q: query,
          quotesCount: 10,
          newsCount: 0,
        },
      });
      
      return response.data.quotes.map((quote: any) => ({
        symbol: quote.symbol,
        description: quote.shortname || quote.longname,
        type: quote.quoteType,
      }));
    }
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
};

// Fetch candle data for multiple symbols
export const getBatchCandleData = async (
  symbols: string[],
  resolution: string = 'D',
  days: number = 100
): Promise<Record<string, CandleData>> => {
  const result: Record<string, CandleData> = {};
  const dataSource = getDataSource();
  
  // Calculate time range
  const from = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
  const to = Math.floor(Date.now() / 1000);
  
  if (dataSource === 'finnhub') {
    // Finnhub doesn't support batch requests for candle data, so we need to make multiple requests
    // To avoid rate limiting, process in batches with delay
    const batchSize = 5; // Process 5 symbols at a time
    const delayMs = 1000; // 1 second delay between batches
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batchSymbols = symbols.slice(i, i + batchSize);
      
      // Process batch concurrently
      await Promise.all(
        batchSymbols.map(async (symbol) => {
          try {
            const data = await getStockCandles(symbol, resolution, from, to);
            result[symbol] = data;
          } catch (error) {
            console.error(`Error fetching candle data for ${symbol}:`, error);
            // In case of error, continue with other symbols
          }
        })
      );
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  } else {
    // Yahoo Finance also doesn't support batch requests, process similarly
    const batchSize = 10; // Yahoo has higher limits, so we can process more at once
    const delayMs = 500; // Less delay needed
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batchSymbols = symbols.slice(i, i + batchSize);
      
      // Process batch concurrently
      await Promise.all(
        batchSymbols.map(async (symbol) => {
          try {
            const data = await getStockCandles(symbol, resolution, from, to);
            result[symbol] = data;
          } catch (error) {
            console.error(`Error fetching candle data for ${symbol}:`, error);
            // In case of error, continue with other symbols
          }
        })
      );
      
      // Add delay between batches
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  return result;
}; 