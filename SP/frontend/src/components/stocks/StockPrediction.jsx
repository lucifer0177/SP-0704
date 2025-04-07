import React from 'react';

const StockPrediction = ({ prediction }) => {
  const { 
    currentPrice, 
    predictedPrice, 
    percentChange, 
    confidence, 
    timeframe, 
    recommendation,
    factors
  } = prediction;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Price Prediction</h2>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
            <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          
          <div className="flex-1 mx-4 h-1 bg-gray-200 dark:bg-gray-700 relative">
            <div className={`absolute h-3 w-3 rounded-full top-1/2 transform -translate-y-1/2 ${
              percentChange >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`} style={{ left: '0%' }}></div>
            <div className={`absolute h-3 w-3 rounded-full top-1/2 transform -translate-y-1/2 ${
              percentChange >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`} style={{ right: '0%' }}></div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Predicted Price ({timeframe})</p>
            <p className="text-2xl font-bold">${predictedPrice.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</p>
              <p className="text-sm font-medium">{confidence}%</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${confidence}%` }}></div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommendation</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              recommendation === 'BUY' ? 'bg-green-100 text-green-800' : 
              recommendation === 'SELL' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {recommendation}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Key Factors</h3>
        <div className="space-y-4">
          {factors.map((factor, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    factor.impact === 'positive' ? 'bg-green-500' :
                    factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></span>
                  <h4 className="text-sm font-medium">{factor.name}</h4>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Weight: {factor.weight}%
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockPrediction;