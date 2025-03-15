/**
 * Technical indicators utility functions
 */

// Calculate Simple Moving Average (SMA)
export const calculateSMA = (data: number[], period: number): number[] => {
  const result: number[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result.push(sum / period);
  }
  
  return result;
};

// Calculate Exponential Moving Average (EMA)
export const calculateEMA = (data: number[], period: number): number[] => {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first EMA value
  let ema = data.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  result.push(ema);
  
  // Calculate EMA for the rest of the data
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
};

// Calculate Average True Range (ATR)
export const calculateATR = (
  high: number[], 
  low: number[], 
  close: number[], 
  period: number = 14
): number[] => {
  const trueRanges: number[] = [];
  const result: number[] = [];
  
  // Calculate True Range for each period
  for (let i = 0; i < high.length; i++) {
    if (i === 0) {
      // First TR is just High - Low
      trueRanges.push(high[i] - low[i]);
    } else {
      // TR = max(high - low, |high - prev_close|, |low - prev_close|)
      const tr1 = high[i] - low[i];
      const tr2 = Math.abs(high[i] - close[i - 1]);
      const tr3 = Math.abs(low[i] - close[i - 1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
  }
  
  // Calculate ATR using simple moving average of TR
  for (let i = period - 1; i < trueRanges.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += trueRanges[i - j];
    }
    result.push(sum / period);
  }
  
  return result;
};

// Calculate MACD (Moving Average Convergence Divergence)
export interface MACD {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

export const calculateMACD = (
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACD => {
  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // Adjust arrays to have the same length
  const diff = slowPeriod - fastPeriod;
  const adjustedFastEMA = fastEMA.slice(diff);
  
  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: number[] = [];
  for (let i = 0; i < adjustedFastEMA.length; i++) {
    macdLine.push(adjustedFastEMA[i] - slowEMA[i]);
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Calculate histogram (MACD line - signal line)
  const histogram: number[] = [];
  for (let i = signalPeriod - 1; i < macdLine.length; i++) {
    histogram.push(macdLine[i] - signalLine[i - (signalPeriod - 1)]);
  }
  
  return {
    macdLine: macdLine.slice(signalPeriod - 1),
    signalLine,
    histogram,
  };
};

// Check if MACD histogram is higher than the previous candle (pink condition)
export const isMACDHistogramHigher = (histogram: number[], index: number): boolean => {
  if (index <= 0 || index >= histogram.length) {
    return false;
  }
  
  return histogram[index] > histogram[index - 1];
};

// Check if MACD histogram is higher than previous candle but below zero
export const isMACDHistogramHigherBelowZero = (
  histogram: number[],
  macdLine: number[],
  index: number
): boolean => {
  if (index <= 0 || index >= histogram.length) {
    return false;
  }
  
  // Check if histogram is higher than previous candle
  const isHigher = histogram[index] > histogram[index - 1];
  
  // Check if MACD line is below zero
  const isBelowZero = macdLine[index] < 0;
  
  return isHigher && isBelowZero;
};

// Calculate Supertrend indicator
export interface Supertrend {
  trend: number[]; // 1 for uptrend (green), -1 for downtrend (red)
  upperBand: number[];
  lowerBand: number[];
}

export const calculateSupertrend = (
  high: number[], 
  low: number[], 
  close: number[], 
  period: number = 10, 
  multiplier: number = 3
): Supertrend => {
  const atr = calculateATR(high, low, close, period);
  
  // Initial empty arrays to match length with final result
  const padding = period - 1;
  const trend: number[] = Array(padding).fill(0);
  const upperBand: number[] = Array(padding).fill(0);
  const lowerBand: number[] = Array(padding).fill(0);
  
  // Calculate Basic Upper and Lower Bands
  for (let i = 0; i < atr.length; i++) {
    const idx = i + padding;
    const hl2 = (high[idx] + low[idx]) / 2;
    const basicUpperBand = hl2 + (multiplier * atr[i]);
    const basicLowerBand = hl2 - (multiplier * atr[i]);
    
    // Initialize or carry forward final bands
    let finalUpperBand = 0;
    let finalLowerBand = 0;
    
    if (i === 0) {
      finalUpperBand = basicUpperBand;
      finalLowerBand = basicLowerBand;
      // Initialize trend based on first close
      trend.push(close[idx] > (high[idx] + low[idx]) / 2 ? 1 : -1);
    } else {
      const prevFinalUpperBand = upperBand[upperBand.length - 1];
      const prevFinalLowerBand = lowerBand[lowerBand.length - 1];
      const prevClose = close[idx - 1];
      
      // Calculate new final upper band
      finalUpperBand = 
        (basicUpperBand < prevFinalUpperBand || prevClose > prevFinalUpperBand) 
          ? basicUpperBand 
          : prevFinalUpperBand;
      
      // Calculate new final lower band
      finalLowerBand = 
        (basicLowerBand > prevFinalLowerBand || prevClose < prevFinalLowerBand) 
          ? basicLowerBand 
          : prevFinalLowerBand;
      
      // Determine trend
      const prevTrend = trend[trend.length - 1];
      let newTrend = prevTrend;
      
      if (prevTrend === 1 && close[idx] < finalLowerBand) {
        newTrend = -1; // Switch to downtrend
      } else if (prevTrend === -1 && close[idx] > finalUpperBand) {
        newTrend = 1; // Switch to uptrend
      }
      
      trend.push(newTrend);
    }
    
    upperBand.push(finalUpperBand);
    lowerBand.push(finalLowerBand);
  }
  
  return { trend, upperBand, lowerBand };
};

// Check if Supertrend is green (uptrend)
export const isSupertrendGreen = (trend: number[], index: number): boolean => {
  if (index < 0 || index >= trend.length) {
    return false;
  }
  
  return trend[index] === 1;
};

// Calculate TTM Squeeze / Squeeze Pro
export interface TTMSqueeze {
  histogram: number[];
  isSqueezing: boolean[];
}

export const calculateTTMSqueeze = (
  high: number[],
  low: number[],
  close: number[],
  period: number = 20,
  bbMultiplier: number = 2,
  kcMultiplier: number = 1.5
): TTMSqueeze => {
  // Calculate Bollinger Bands
  const sma = calculateSMA(close, period);
  const stdev = close.slice(period - 1).map((_, i) => {
    const slice = close.slice(i, i + period);
    const mean = slice.reduce((sum, val) => sum + val, 0) / period;
    const sqDiffs = slice.map(value => Math.pow(value - mean, 2));
    const variance = sqDiffs.reduce((sum, val) => sum + val, 0) / period;
    return Math.sqrt(variance);
  });
  
  // Calculate Keltner Channels
  const atr = calculateATR(high, low, close, period);
  
  // Calculate Squeeze and Momentum
  const histogram: number[] = [];
  const isSqueezing: boolean[] = [];
  
  for (let i = 0; i < sma.length; i++) {
    // Calculate BB and KC bands
    const bbUpper = sma[i] + (bbMultiplier * stdev[i]);
    const bbLower = sma[i] - (bbMultiplier * stdev[i]);
    const kcUpper = sma[i] + (kcMultiplier * atr[i]);
    const kcLower = sma[i] - (kcMultiplier * atr[i]);
    
    // Determine if market is "squeezing" (BB inside KC)
    const squeeze = (bbLower > kcLower) && (bbUpper < kcUpper);
    isSqueezing.push(squeeze);
    
    // Calculate momentum (histogram) based on linear regression
    const idx = i + (period - 1);
    const currentClose = close[idx];
    const highestHigh = Math.max(...high.slice(idx - period + 1, idx + 1));
    const lowestLow = Math.min(...low.slice(idx - period + 1, idx + 1));
    const midpoint = (highestHigh + lowestLow) / 2;
    
    // Linear regression distance from midpoint
    const linregMomentum = currentClose - midpoint;
    histogram.push(linregMomentum);
  }
  
  return {
    histogram,
    isSqueezing
  };
};

// Check if TTM Squeeze histogram is below zero
export const isTTMSqueezeHistogramBelowZero = (histogram: number[], index: number): boolean => {
  if (index < 0 || index >= histogram.length) {
    return false;
  }
  
  return histogram[index] < 0;
};

// MACD scan - histogram higher than previous candle but below zero
export const scanMACDPinkBelowZero = (stocksData: { symbol: string; close: number[] }[]): string[] => {
  const results: string[] = [];
  
  for (const stock of stocksData) {
    const macd = calculateMACD(stock.close);
    const lastIndex = macd.histogram.length - 1;
    
    if (isMACDHistogramHigherBelowZero(macd.histogram, macd.macdLine, lastIndex)) {
      results.push(stock.symbol);
    }
  }
  
  return results;
};

// Combo scan - MACD criteria + Supertrend is green
export const scanCombo = (
  stocksData: { 
    symbol: string; 
    close: number[];
    high: number[];
    low: number[];
  }[]
): string[] => {
  const results: string[] = [];
  
  for (const stock of stocksData) {
    const macd = calculateMACD(stock.close);
    const supertrend = calculateSupertrend(stock.high, stock.low, stock.close);
    
    const lastIndex = macd.histogram.length - 1;
    const stLastIndex = supertrend.trend.length - 1;
    
    if (
      isMACDHistogramHigherBelowZero(macd.histogram, macd.macdLine, lastIndex) &&
      isSupertrendGreen(supertrend.trend, stLastIndex)
    ) {
      results.push(stock.symbol);
    }
  }
  
  return results;
};

// Ultimate scan - Combo criteria + TTM Squeeze histogram below zero
export const scanUltimate = (
  stocksData: { 
    symbol: string; 
    close: number[];
    high: number[];
    low: number[];
  }[]
): string[] => {
  const results: string[] = [];
  
  for (const stock of stocksData) {
    const macd = calculateMACD(stock.close);
    const supertrend = calculateSupertrend(stock.high, stock.low, stock.close);
    const ttmSqueeze = calculateTTMSqueeze(stock.high, stock.low, stock.close);
    
    const lastIndex = macd.histogram.length - 1;
    const stLastIndex = supertrend.trend.length - 1;
    const sqLastIndex = ttmSqueeze.histogram.length - 1;
    
    if (
      isMACDHistogramHigherBelowZero(macd.histogram, macd.macdLine, lastIndex) &&
      isSupertrendGreen(supertrend.trend, stLastIndex) &&
      isTTMSqueezeHistogramBelowZero(ttmSqueeze.histogram, sqLastIndex)
    ) {
      results.push(stock.symbol);
    }
  }
  
  return results;
};

// Original MACD scan implementation (maintain for compatibility)
export const scanMACDPink = (stocksData: { symbol: string; close: number[] }[]): string[] => {
  const results: string[] = [];
  
  for (const stock of stocksData) {
    const macd = calculateMACD(stock.close);
    const lastIndex = macd.histogram.length - 1;
    
    if (isMACDHistogramHigher(macd.histogram, lastIndex)) {
      results.push(stock.symbol);
    }
  }
  
  return results;
}; 