import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock data for market overview
  const marketData = {
    indices: [
      { name: 'S&P 500', value: 5280.14, change: 42.32, percentChange: 0.81 },
      { name: 'Nasdaq', value: 16742.39, change: -23.87, percentChange: -0.14 },
      { name: 'Dow Jones', value: 38905.66, change: 156.87, percentChange: 0.40 }
    ],
    topMovers: {
      gainers: [
        { symbol: 'NVDA', name: 'NVIDIA Corp', price: 950.37, percentChange: 5.42 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 178.22, percentChange: 3.78 },
        { symbol: 'AAPL', name: 'Apple Inc', price: 243.56, percentChange: 1.34 }
      ],
      losers: [
        { symbol: 'META', name: 'Meta Platforms', price: 475.12, percentChange: -2.48 },
        { symbol: 'AMZN', name: 'Amazon.com Inc', price: 178.92, percentChange: -1.85 },
        { symbol: 'MSFT', name: 'Microsoft Corp', price: 420.87, percentChange: -0.60 }
      ]
    },
    news: [
      {
        id: 1,
        title: 'Fed Signals Potential Rate Cut in Coming Months',
        source: 'Financial Times',
        timestamp: '2025-04-03 04:15:22',
        sentiment: 'positive'
      },
      {
        id: 2,
        title: 'Tech Rally Continues as AI Investments Surge',
        source: 'CNBC',
        timestamp: '2025-04-03 03:45:11',
        sentiment: 'positive'
      },
      {
        id: 3,
        title: 'Oil Prices Decline on Higher Inventory Data',
        source: 'Bloomberg',
        timestamp: '2025-04-03 02:30:45',
        sentiment: 'negative'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketData.indices.map((index) => (
          <div key={index.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{index.name}</h3>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                index.percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {index.percentChange >= 0 ? '+' : ''}{index.percentChange}%
              </span>
            </div>
            <p className="text-2xl font-bold mt-2">{index.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className={`text-sm mt-1 ${index.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {index.percentChange >= 0 ? '+' : ''}{index.change.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-100 dark:border-green-900/30">
            <h2 className="text-lg font-medium text-green-800 dark:text-green-400">Top Gainers</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {marketData.topMovers.gainers.map((stock) => (
              <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{stock.symbol}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</p>
                    <p className="text-sm font-medium text-green-600">+{stock.percentChange}%</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-100 dark:border-red-900/30">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-400">Top Losers</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {marketData.topMovers.losers.map((stock) => (
              <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{stock.symbol}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</p>
                    <p className="text-sm font-medium text-red-600">{stock.percentChange}%</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Market News */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Latest Market News</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {marketData.news.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 mr-3 mt-1 w-2 h-2 rounded-full ${
                  item.sentiment === 'positive' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{item.source}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-center">
          <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline">View All News</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;