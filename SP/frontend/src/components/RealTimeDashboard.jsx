import React, { useState, useEffect } from 'react';
import { useRealTimeData } from '../contexts/RealTimeDataContext';
import MarketDataService from '../services/MarketDataService';
import LiveStockCard from './LiveStockCard';
import StockTicker from './StockTicker';
import LiveChart from './LiveChart';

/**
 * Real-time Dashboard Component
 * Displays market overview and real-time stock information
 */
const RealTimeDashboard = () => {
  const [marketSummary, setMarketSummary] = useState(null);
  const [marketMovers, setMarketMovers] = useState(null);
  const [mostWatched, setMostWatched] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { watchlist, startAutoRefresh } = useRealTimeData();
  const currentDate = new Date("2025-04-03 07:12:05"); // Updated with the latest timestamp

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [summaryResponse, moversResponse, watchedResponse] = await Promise.all([
          MarketDataService.getMarketSummary(),
          MarketDataService.getMarketMovers(),
          MarketDataService.getMostWatched()
        ]);
        
        setMarketSummary(summaryResponse.data);
        setMarketMovers(moversResponse.data);
        setMostWatched(watchedResponse.data);
        
        // Extract all unique symbols for real-time updates
        const uniqueSymbols = new Set();
        
        // Add symbols from market movers
        moversResponse.data.gainers.forEach(stock => uniqueSymbols.add(stock.symbol));
        moversResponse.data.losers.forEach(stock => uniqueSymbols.add(stock.symbol));
        
        // Add symbols from most watched
        watchedResponse.data.stocks.forEach(stock => uniqueSymbols.add(stock.symbol));
        
        // Add watchlist symbols
        watchlist.forEach(symbol => uniqueSymbols.add(symbol));
        
        // Start auto-refreshing for these symbols
        if (uniqueSymbols.size > 0) {
          startAutoRefresh([...uniqueSymbols]);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(loadDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [watchlist, startAutoRefresh]);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Stock Ticker */}
      <StockTicker />
      
      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Market Summary */}
        <div className="mb-6 bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Market Summary</h2>
          
          {marketSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {marketSummary.indices.map(index => {
                const isPositive = index.percentChange >= 0;
                return (
                  <div key={index.name} className="p-3 bg-gray-700 rounded-lg">
                    <h3 className="text-md font-semibold text-white">{index.name}</h3>
                    <p className="text-xl font-bold text-white mt-1">{index.value.toFixed(2)}</p>
                    <p className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{index.change.toFixed(2)} ({isPositive ? '+' : ''}{index.percentChange.toFixed(2)}%)
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Market Status */}
          {marketSummary && (
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className={`h-3 w-3 rounded-full ${marketSummary.marketStatus === 'open' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                <span className="text-gray-300">Market {marketSummary.marketStatus === 'open' ? 'Open' : 'Closed'}</span>
              </div>
              <div className="text-xs text-gray-400">
                Last Updated: {currentDate.toLocaleString()} {/* Using the latest timestamp */}
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mb-4 border-b border-gray-700">
          <nav className="flex space-x-4">
            <button
              className={`py-2 px-3 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-2 px-3 ${activeTab === 'gainers' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('gainers')}
            >
              Top Gainers
            </button>
            <button
              className={`py-2 px-3 ${activeTab === 'losers' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('losers')}
            >
              Top Losers
            </button>
            <button
              className={`py-2 px-3 ${activeTab === 'watchlist' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('watchlist')}
            >
              Your Watchlist
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div>
              {/* Market Sectors Performance */}
              {marketSummary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Sector Performance</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {marketSummary.sectorPerformance.map(sector => {
                      const isPositive = sector.percentChange >= 0;
                      return (
                        <div key={sector.name} className="bg-gray-700 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-white">{sector.name}</h4>
                          <p className={`text-md font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{sector.percentChange.toFixed(1)}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Most Watched */}
              {mostWatched && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Most Watched</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {mostWatched.stocks.map(stock => (
                      <LiveStockCard key={stock.symbol} symbol={stock.symbol} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'gainers' && marketMovers && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {marketMovers.gainers.map(stock => (
                <LiveStockCard key={stock.symbol} symbol={stock.symbol} />
              ))}
            </div>
          )}
          
          {activeTab === 'losers' && marketMovers && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {marketMovers.losers.map(stock => (
                <LiveStockCard key={stock.symbol} symbol={stock.symbol} />
              ))}
            </div>
          )}
          
          {activeTab === 'watchlist' && (
            <div>
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {watchlist.map(symbol => (
                    <LiveStockCard key={symbol} symbol={symbol} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8">
                  <p className="text-gray-400 mb-4">Your watchlist is empty</p>
                  <p className="text-sm text-gray-500">Add stocks to your watchlist by clicking the star icon on any stock card</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;