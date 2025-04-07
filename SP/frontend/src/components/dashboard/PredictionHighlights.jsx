import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowSmUpIcon, QuestionMarkCircleIcon } from '@heroicons/react/solid';

const PredictionHighlights = ({ predictions }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prediction</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Potential</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confidence</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {predictions.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-4 whitespace-nowrap">
                <Link to={`/stock/${item.symbol}`} className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.name}</div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">${item.currentPrice.toFixed(2)}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">${item.predictedPrice.toFixed(2)}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-green-600">
                  <ArrowSmUpIcon className="h-4 w-4 mr-1" />
                  <span>+{item.percentChange.toFixed(2)}%</span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="relative">
                  <div className="flex items-center">
                    <div className="flex-grow w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-2">
                      {item.confidence}%
                    </div>
                    <button
                      className="ml-1 text-gray-400 hover:text-gray-500"
                      onClick={() => setActiveTooltip(activeTooltip === index ? null : index)}
                    >
                      <QuestionMarkCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {activeTooltip === index && (
                    <div className="absolute z-10 w-64 right-0 mt-2 p-3 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300">
                      <p className="font-medium mb-1">How confidence is calculated:</p>
                      <p>Our XAI model analyzes historical data, market trends, company financials, and sentiment analysis to provide a confidence score for each prediction.</p>
                      <p className="mt-1">Higher scores indicate stronger signals and more consistent patterns across multiple indicators.</p>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                  {item.recommendation}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4 text-center">
        <Link to="/predictions" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          View all predictions
        </Link>
      </div>
    </div>
  );
};

export default PredictionHighlights;