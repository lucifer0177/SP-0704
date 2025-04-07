import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealTimeData } from '../contexts/RealTimeDataContext';
import MarketDataService from '../services/MarketDataService';

/**
 * LiveStockCard Component
 * Displays real-time stock information in a card format
 */
const LiveStockCard = ({ symbol, showDetails = true }) => {
  const navigate = useNavigate();
  const { getStockData, realTimeStocks, addToWatchlist, removeFromWatchlist, watchlist } = useRealTimeData();
  const stockData = realTimeStocks[symbol];
  const isInWatchlist = watchlist.includes(symbol);

  useEffect(() => {
    if (!stockData) {
      getStockData(symbol);
    }
  }, [symbol, stockData, getStockData]);

  const handleViewDetails = () => {
    navigate(`/stock/${symbol}`);
  };

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    if (isInWatchlist) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  if (!stockData) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-pulse h-32">
        <div className="h-4 bg-gray-600 rounded w-1/4 mb-3"></div>
        <div className="h-6 bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-600 rounded w-1/3"></div>
      </div>
    );
  }

  const { price, change, percentChange, name } = stockData;
  const isPositive = change >= 0;
  const updatedAtText = stockData.timestamp 
    ? MarketDataService.getTimeSince(stockData.timestamp)
    : 'just now';

  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-700" 
      onClick={handleViewDetails}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">{symbol}</h3>
          <p className="text-sm text-gray-400">{name}</p>
        </div>
        <button 
          className={`p-2 rounded-full transition-colors ${isInWatchlist ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400'}`}
          onClick={toggleWatchlist}
          aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={isInWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xl font-bold text-white">${price.toFixed(2)}</span>
          <span className={`${isPositive ? 'text-green-400' : 'text-red-400'} font-medium`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
          </span>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>
            <span>Open: </span>
            <span className="text-white">${stockData.open.toFixed(2)}</span>
          </div>
          <div>
            <span>Prev Close: </span>
            <span className="text-white">${stockData.previousClose.toFixed(2)}</span>
          </div>
          <div>
            <span>Volume: </span>
            <span className="text-white">{stockData.volume.toFixed(1)}M</span>
          </div>
          <div>
            <span>Mkt Cap: </span>
            <span className="text-white">${stockData.marketCap.toFixed(2)}T</span>
          </div>
        </div>
      )}
      
      <div className="mt-3 text-right text-xs text-gray-500">
        Updated {updatedAtText}
      </div>
    </div>
  );
};

export default LiveStockCard;