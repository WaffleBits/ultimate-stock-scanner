import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CandleData } from '../../services/stockApi';

interface StockChartProps {
  symbol: string;
  data: CandleData;
  showMacd?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({ symbol, data, showMacd = false }) => {
  // Convert the data to the format expected by Recharts
  const chartData = data?.timestamp?.map((time, index) => {
    const date = new Date(time * 1000);
    return {
      date: date.toLocaleDateString(),
      open: data.open[index],
      high: data.high[index],
      low: data.low[index],
      close: data.close[index],
      volume: data.volume[index],
    };
  }) || [];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">{symbol} Chart</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Price Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#ccc' }} 
              tickFormatter={(value) => value.substring(0, 5)}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fill: '#ccc' }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: 'none' }} 
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.3} 
              name="Price" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Volume</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#ccc' }} 
              tickFormatter={(value) => value.substring(0, 5)}
            />
            <YAxis 
              tick={{ fill: '#ccc' }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: 'none' }} 
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [value.toLocaleString(), 'Volume']}
            />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#82ca9d" 
              fill="#82ca9d" 
              fillOpacity={0.3} 
              name="Volume" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart; 