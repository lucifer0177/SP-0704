import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowSmUpIcon, ArrowSmDownIcon, InformationCircleIcon } from '@heroicons/react/solid';

const StockCard = ({ stock, showPrediction = false }) => {
  const isPositive = stock.percentChange >= 0;
  
  return (
    <div className="flex flex-col">
      <Link to={`/stock/${stock.symbol}`} className="block">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{stock.symbol}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowSmUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowSmDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </Link>
      
      {showPrediction && stock.prediction && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">AI Prediction</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Target price: <span className="font-medium">${stock.prediction.target.toFixed(2)}</span> in {stock.prediction.timeframe}
              </p>
              <div className="mt-2 flex items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mr-2">Confidence:</div>
                <div className="flex-grow bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${stock.prediction.confidence}%` }}
                  ></div>
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-2">
                  {stock.prediction.confidence}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockCard;