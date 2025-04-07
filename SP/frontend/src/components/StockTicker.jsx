import React, { useEffect, useState } from 'react';
import { useRealTimeData } from '../contexts/RealTimeDataContext';

/**
 * Stock Ticker Component
 * Displays a horizontal scrolling ticker of stock prices
 */
const StockTicker = ({ symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'] }) => {
  const { realTimeStocks, fetchLatestData } = useRealTimeData();
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  useEffect(() => {
    // Initially fetch the data
    fetchLatestData(symbols);

    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchLatestData(symbols);
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [symbols, fetchLatestData]);

  // Format price change with proper color and sign
  const formatPriceChange = (change, percentChange) => {
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    
    return (
      <span className={colorClass}>
        {sign}{change.toFixed(2)} ({sign}{percentChange.toFixed(2)}%)
      </span>
    );
  };

  return (
    <div 
      className="bg-gray-900 text-white py-2 overflow-hidden border-t border-b border-gray-700"
      onMouseEnter={() => setIsAnimationPaused(true)}
      onMouseLeave={() => setIsAnimationPaused(false)}
    >
      <div 
        className={`flex ${isAnimationPaused ? 'animate-none' : 'animate-marquee'}`}
        style={{ width: 'fit-content' }}
      >
        {symbols.map(symbol => {
          const stockData = realTimeStocks[symbol];
          
          if (!stockData) {
            return (
              <div key={symbol} className="mx-4 flex items-center opacity-70">
                {symbol} <span className="ml-1">Loading...</span>
              </div>
            );
          }
          
          return (
            <div key={symbol} className="mx-4 flex items-center">
              <span className="font-semibold mr-1">{symbol}</span>
              <span className="mr-2">{stockData.price.toFixed(2)}</span>
              {formatPriceChange(stockData.change, stockData.percentChange)}
            </div>
          );
        })}
        
        {/* Duplicate for seamless scrolling */}
        {symbols.map(symbol => {
          const stockData = realTimeStocks[symbol];
          
          if (!stockData) {
            return (
              <div key={`${symbol}-dup`} className="mx-4 flex items-center opacity-70">
                {symbol} <span className="ml-1">Loading...</span>
              </div>
            );
          }
          
          return (
            <div key={`${symbol}-dup`} className="mx-4 flex items-center">
              <span className="font-semibold mr-1">{symbol}</span>
              <span className="mr-2">{stockData.price.toFixed(2)}</span>
              {formatPriceChange(stockData.change, stockData.percentChange)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockTicker;