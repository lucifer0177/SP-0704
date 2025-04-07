import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import MarketDataService from '../services/MarketDataService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * LiveChart Component
 * Displays real-time stock price chart with timeframe selection
 */
const LiveChart = ({ symbol, initialTimeframe = '1m' }) => {
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  // Available timeframe options
  const timeframeOptions = [
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const response = await MarketDataService.getHistoricalData(symbol, timeframe);
      if (response.success) {
        setChartData(response.data);
      } else {
        setError("Failed to load chart data");
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("An error occurred while loading chart data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    
    // Set up refresh interval - different refresh rates for different timeframes
    if (timeframe === '1d') {
      // For 1 day view, refresh every minute
      refreshTimerRef.current = setInterval(fetchChartData, 60000);
    } else if (timeframe === '1w') {
      // For 1 week view, refresh every 5 minutes
      refreshTimerRef.current = setInterval(fetchChartData, 5 * 60000);
    } else {
      // For longer timeframes, refresh every 30 minutes
      refreshTimerRef.current = setInterval(fetchChartData, 30 * 60000);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [symbol, timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxRotation: 0,
          autoSkipPadding: 15
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  if (isLoading && !chartData) {
    return (
      <div className="h-64 flex justify-center items-center bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex justify-center items-center bg-gray-800 rounded-lg">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-64 flex justify-center items-center bg-gray-800 rounded-lg">
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: symbol,
        data: chartData.data,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Price History</h3>
        <div className="flex space-x-1">
          {timeframeOptions.map(option => (
            <button
              key={option.value}
              className={`px-2 py-1 text-xs rounded ${timeframe === option.value ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => handleTimeframeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative h-64">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <Line data={data} options={chartOptions} />
      </div>
      
      <div className="mt-2 text-right text-xs text-gray-500">
        Updated: {MarketDataService.formatTimestamp(chartData.updated_at)}
      </div>
    </div>
  );
};

export default LiveChart;