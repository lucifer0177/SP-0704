import React, { useState } from 'react';

const Watchlist = () => {
  // Mock data for watchlist stocks
  const [watchlistStocks] = useState([
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      price: 243.56, 
      change: 3.21, 
      percentChange: 1.34,
      added: '2025-03-01'
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corporation', 
      price: 420.87, 
      change: -2.53, 
      percentChange: -0.60,
      added: '2025-02-15'
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc.', 
      price: 187.63, 
      change: 1.75, 
      percentChange: 0.94,
      added: '2025-03-10'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Watchlist</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          + Add Stock
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol / Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Added</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {watchlistStocks.map((stock) => (
              <tr key={stock.symbol}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stock.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {stock.added}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">View</button>
                  <span className="mx-2">|</span>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Watchlist;