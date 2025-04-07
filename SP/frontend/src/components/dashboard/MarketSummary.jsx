import React from 'react';
import { ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/solid';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

const MarketSummary = ({ data }) => {
  // Mock chart data - in a real app, this would be historical data
  const chartData = {
    labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'],
    datasets: [
      {
        label: 'S&P 500',
        data: [5880, 5875, 5890, 5900, 5905, 5910, 5895, 5900, 5908, 5915, 5920, 5918, 5925, 5923.47],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxTicksLimit: 7
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: (value) => `$${value}`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4">
        {data.indices.map((index, i) => (
          <div key={i} className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{index.name}</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{index.value.toFixed(2)}</p>
            </div>
            <div className={`flex items-center text-sm ${index.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {index.percentChange >= 0 ? (
                <ArrowSmUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowSmDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>
                {index.percentChange >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.percentChange >= 0 ? '+' : ''}{index.percentChange.toFixed(2)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 text-xs text-right text-gray-500 dark:text-gray-400">
        Last updated: {data.timestamp} UTC
      </div>
    </div>
  );
};

export default MarketSummary;