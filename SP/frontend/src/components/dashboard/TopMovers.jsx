import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/solid';

const TopMovers = ({ stocks, type }) => {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {stocks.map((stock, index) => (
        <Link 
          key={index} 
          to={`/stock/${stock.symbol}`}
          className="block py-2 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-4 px-4 rounded-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{stock.symbol}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate" style={{ maxWidth: '150px' }}>
                {stock.name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-base font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
              <div 
                className={`flex items-center text-sm ${
                  type === 'gainers' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {type === 'gainers' ? (
                  <ArrowSmUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowSmDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>
                  {type === 'gainers' ? '+' : ''}{stock.change.toFixed(2)} ({type === 'gainers' ? '+' : ''}{stock.percentChange.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TopMovers;