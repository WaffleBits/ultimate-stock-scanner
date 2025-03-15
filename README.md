# Ultimate Stock Scanner

Ultimate Stock Scanner is a powerful web application for analyzing stock market data, running technical indicator scans, and receiving real-time alerts. The application features interactive charts, watchlist management, multiple scan types, and Discord alerts.

## Features

- **Multiple Data Sources**: Choose between Finnhub API or Yahoo Finance (no API key required)
- **Real-time Stock Data**: Get up-to-date market information
- **Interactive Stock Charts**: Visualize price action with customizable timeframes
- **Watchlist Management**: Create and manage stock watchlists
- **TradingView Import**: Import watchlists directly from TradingView
- **Technical Indicator Scanning**: Multiple scan types to find trading opportunities
- **Discord Alerts**: Receive notifications via Discord webhooks
- **User Accounts**: Save preferences, watchlists and settings

### Scan Types

1. **MACD Scan**: Identifies stocks where the MACD histogram is higher than the previous candle
2. **MACD Below Zero Scan**: Finds stocks where the MACD histogram is higher than the previous candle and below the zero line
3. **Combo Scan**: Combines the MACD Below Zero scan with a check if the Supertrend indicator is green (bullish)
4. **Ultimate Scan**: The Combo scan plus verification that the TTM Squeeze histogram is below zero

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API Integration**: Axios for data fetching
- **Data Visualization**: Recharts for stock charts
- **Local Storage**: For saving settings and user preferences
- **Discord Integration**: Webhook API for alerts

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/stock-scanner-ui.git
   cd stock-scanner-ui
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

#### Quick Start (Windows)
Simply double-click the `run-app.bat` file included in the project. This will:
- Start the development server
- Open your browser to the application automatically

#### Manual Start
1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

## Usage

### Setting Up

1. **Data Source**: Choose between Yahoo Finance (no API key required) or Finnhub
2. **API Key**: If using Finnhub, get a free API key from [Finnhub](https://finnhub.io/) and enter it in the Settings page
3. **Discord Webhook**: Create a webhook in your Discord server and add the URL in Settings to enable alerts
4. **Create an Account**: Register to save your settings permanently

### Basic Workflow

1. **Add stocks** to your watchlist manually or import from TradingView
2. **View charts** by selecting stocks from your watchlist
3. **Run scans** to identify potential trading opportunities
4. **Receive alerts** on Discord when scan results are available

### Technical Indicators

The application uses several technical indicators:

- **MACD (Moving Average Convergence Divergence)**: A trend-following momentum indicator
- **Supertrend**: A trend detection indicator that shows the current trend direction
- **TTM Squeeze (John Carter's Squeeze)**: Identifies periods of low volatility that often precede significant price moves

## API Integration

The application supports two data sources:

### Yahoo Finance (Default)
- No API key required
- Good for general use and testing
- Slightly limited data compared to premium APIs

### Finnhub API
1. Register for a free API key at [Finnhub](https://finnhub.io/)
2. Enter your API key in the Settings page of the application
3. Note that free API keys have rate limits (60 calls/minute)

## Future Enhancements

- **Additional Scan Types**: More technical indicator combinations
- **Historical Scan Results**: Track past scan success rates
- **Mobile Application**: Native mobile versions
- **Backtesting**: Test scan strategies against historical data
- **Additional Alert Channels**: Email, SMS, or mobile push notifications
- **Advanced Chart Features**: Drawing tools and more indicators
- **Social Features**: Share watchlists and scan results
- **Premium Data Integration**: Options data and advanced fundamentals

## Acknowledgments

- [Yahoo Finance](https://finance.yahoo.com/) for the free stock data API
- [Finnhub](https://finnhub.io/) for the stock market data API
- [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) for the development framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for chart visualization
- [Discord](https://discord.com/) for the webhooks API
