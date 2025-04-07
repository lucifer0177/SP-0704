import React from 'react';

const Analysis = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Market Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sector Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Technology</span>
                <span className="text-sm font-medium text-green-600">+2.3%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Healthcare</span>
                <span className="text-sm font-medium text-green-600">+1.5%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Financials</span>
                <span className="text-sm font-medium text-red-600">-0.7%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '43%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Energy</span>
                <span className="text-sm font-medium text-red-600">-1.2%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Market Sentiment</h2>
          <div className="flex justify-center mb-4">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">62</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#EBEDF0"
                  strokeWidth="4"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  strokeDasharray="62, 100"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="text-center mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Moderately Bullish</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p>Current market sentiment is leaning bullish, supported by recent economic data and positive earnings reports from major companies.</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Economic Indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">GDP Growth (Annual)</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3.2%</p>
              <span className="text-green-600 text-sm">↑ 0.2% from previous</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Inflation Rate</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2.8%</p>
              <span className="text-red-600 text-sm">↑ 0.1% from previous</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unemployment Rate</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3.9%</p>
              <span className="text-green-600 text-sm">↓ 0.2% from previous</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Interest Rate</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4.25%</p>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Unchanged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;