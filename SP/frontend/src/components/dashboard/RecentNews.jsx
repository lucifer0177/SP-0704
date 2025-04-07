import React from 'react';
import { ClockIcon } from '@heroicons/react/outline';

const RecentNews = ({ news }) => {
  // Function to format the timestamp
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (60 * 1000));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hr ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {news.map((item) => (
        <a 
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-3 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-4 px-4 rounded-md"
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 mr-3 mt-1 w-2 h-2 rounded-full ${
              item.sentiment === 'positive' ? 'bg-green-500' : 
              item.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h3>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.source}</span>
                <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {formatTimeAgo(item.timestamp)}
                </div>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default RecentNews;