import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRealTimeData } from '../contexts/RealTimeDataContext';
import MarketDataService from '../services/MarketDataService';
import LiveChart from '../components/LiveChart';

const StockDetailsPage = () => {
  const { symbol } = useParams();
  const { getStockData, realTimeStocks, addToWatchlist, removeFromWatchlist, watchlist } = useRealTimeData();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const stockData = realTimeStocks[symbol];
  const isInWatchlist = watchlist.includes(symbol);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch stock data if not already available
        if (!stockData) {
          await getStockData(symbol);
        }
        
        // Get prediction
        const predictionResponse = await MarketDataService.getPrediction(symbol, '3m');
        if (predictionResponse.success) {
          setPrediction(predictionResponse.data);
        }
      } catch (err) {
        console.error("Error loading stock details:", err);
        setError("Failed to load stock data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [symbol, stockData, getStockData]);

  const toggleWatchlist = () => {
    if (isInWatchlist) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  if (isLoading && !stockData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          <p>Error loading stock data for {symbol}</p>
          <p className="text-sm mt-2">{error || "Stock data unavailable"}</p>
        </div>
      </div>
    );
  }

  const { price, change, percentChange, name } = stockData;
  const isPositive = change >= 0;
  
  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mr-2">{symbol}</h1>
            <button 
              className={`p-2 rounded-full transition-colors ${isInWatchlist ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400'}`}
              onClick={toggleWatchlist}
              aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isInWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400">{name}</p>
        </div>
        
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-3xl font-bold text-white">${price.toFixed(2)}</p>
          <p className={`text-xl ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
          </p>
          <p className="text-xs text-gray-500">
            Updated: {MarketDataService.formatTimestamp(stockData.timestamp)}
          </p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="mb-8">
        <LiveChart symbol={symbol} initialTimeframe="3m" />
      </div>
      
      {/* Stock Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Key Stats */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Key Statistics</h2>
          <div className="grid grid-cols-2 gap-y-3">
            <div>
              <p className="text-gray-400 text-sm">Open</p>
              <p className="text-white">${stockData.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Previous Close</p>
              <p className="text-white">${stockData.previousClose.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Day's Range</p>
              <p className="text-white">${stockData.low52w.toFixed(2)} - ${stockData.high52w.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">52 Week Range</p>
              <p className="text-white">${stockData.low52w.toFixed(2)} - ${stockData.high52w.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Volume</p>
              <p className="text-white">{stockData.volume.toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Volume</p>
              <p className="text-white">{stockData.avgVolume.toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Market Cap</p>
              <p className="text-white">${stockData.marketCap.toFixed(2)}T</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">P/E Ratio</p>
              <p className="text-white">{stockData.pe > 0 ? stockData.pe.toFixed(2) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">EPS</p>
              <p className="text-white">${stockData.eps.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Dividend Yield</p>
              <p className="text-white">{stockData.dividend > 0 ? `${stockData.dividend.toFixed(2)}%` : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Prediction */}
        {prediction ? (
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">
              Price Prediction
              <span className="ml-2 text-sm font-normal text-gray-400">({prediction.timeframe})</span>
            </h2>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Current:</span>
                <span className="text-white font-semibold">${prediction.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Predicted:</span>
                <span className="text-white font-semibold">${prediction.predictedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Change:</span>
                <span className={prediction.percentChange >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {prediction.percentChange >= 0 ? '+' : ''}{prediction.percentChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Confidence:</span>
                <span className="text-white font-semibold">{prediction.confidence}%</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Recommendation:</span>
                <span className={`font-semibold ${
                  prediction.recommendation === 'STRONG BUY' || prediction.recommendation === 'BUY' ? 'text-green-400' :
                  prediction.recommendation === 'HOLD' ? 'text-blue-400' :
                  prediction.recommendation === 'WATCH' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {prediction.recommendation}
                </span>
              </div>
              
              {prediction.factors && prediction.factors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Contributing Factors:</h3>
                  {prediction.factors.map((factor, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">{factor.name}</span>
                        <span className={`text-sm ${
                          factor.impact === 'positive' ? 'text-green-400' :
                          factor.impact === 'neutral' ? 'text-gray-400' : 'text-red-400'
                        }`}>
                          {factor.weight}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{factor.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500 text-right">
                Generated: {MarketDataService.formatTimestamp(prediction.generatedAt)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      
      {/* Analyst Recommendations */}
      {stockData.analyst && (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Analyst Recommendations</h2>
          
          <div className="flex items-center mb-4">
            <div className="flex-grow h-4 bg-gray-700 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div className="bg-green-500 h-full" style={{ width: `${stockData.analyst.buy / (stockData.analyst.buy + stockData.analyst.hold + stockData.analyst.sell) * 100}%` }}></div>
                <div className="bg-blue-500 h-full" style={{ width: `${stockData.analyst.hold / (stockData.analyst.buy + stockData.analyst.hold + stockData.analyst.sell) * 100}%` }}></div>
                <div className="bg-red-500 h-full" style={{ width: `${stockData.analyst.sell / (stockData.analyst.buy + stockData.analyst.hold + stockData.analyst.sell) * 100}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="font-semibold text-green-400">{stockData.analyst.buy}</p>
              <p className="text-xs text-gray-400">Buy</p>
            </div>
            <div>
              <p className="font-semibold text-blue-400">{stockData.analyst.hold}</p>
              <p className="text-xs text-gray-400">Hold</p>
            </div>
            <div>
              <p className="font-semibold text-red-400">{stockData.analyst.sell}</p>
              <p className="text-xs text-gray-400">Sell</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetailsPage;