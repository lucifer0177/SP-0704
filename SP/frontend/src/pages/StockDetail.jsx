import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  ArrowSmUpIcon, 
  ArrowSmDownIcon, 
  ClockIcon,
  InformationCircleIcon,
  ChartBarIcon,
  NewspaperIcon,
  DocumentTextIcon,
  LightningBoltIcon
} from '@heroicons/react/solid';
import StockPrediction from '../components/stocks/StockPrediction';

// Register Chart.js components
Chart.register(...registerables);

const StockDetail = () => {
  const { symbol } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [timeframe, setTimeframe] = useState('1m');
  const [tab, setTab] = useState('overview');
  
  // Mock data loading (would be API call in real app)
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock stock data
      const mockStock = {
        symbol: symbol,
        name: symbol === 'AAPL' ? 'Apple Inc.' : 
              symbol === 'MSFT' ? 'Microsoft Corporation' : 
              symbol === 'GOOGL' ? 'Alphabet Inc.' : 
              `${symbol} Corp`,
        price: 243.56,
        change: 3.21,
        percentChange: 1.34,
        marketCap: 2.78,  // in trillions
        volume: 45.3,     // in millions
        avgVolume: 42.1,  // in millions
        pe: 28.5,
        eps: 8.54,
        dividend: 0.92,   // percentage
        high52w: 256.78,
        low52w: 179.45,
        open: 240.35,
        previousClose: 240.35,
        analyst: {
          buy: 24,
          hold: 8,
          sell: 2
        },
        prediction: {
          currentPrice: 243.56,
          predictedPrice: 275.00,
          percentChange: 12.91,
          confidence: 85,
          timeframe: '3 months',
          recommendation: 'BUY',
          factors: [
            { name: 'Technical Analysis', impact: 'positive', weight: 35, description: 'Bullish patterns on multiple timeframes' },
            { name: 'Fundamental Analysis', impact: 'positive', weight: 30, description: 'Strong earnings growth and healthy balance sheet' },
            { name: 'Market Sentiment', impact: 'positive', weight: 20, description: 'Positive news and social media sentiment' },
            { name: 'Sector Performance', impact: 'neutral', weight: 15, description: 'Technology sector showing mixed signals' }
          ]
        },
        historicalData: {
          '1d': {
            labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'],
            data: [240.35, 241.20, 241.75, 242.10, 241.85, 242.30, 242.65, 243.10, 243.25, 243.70, 243.35, 243.80, 243.95, 243.56]
          },
          '1w': {
            labels: ['Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed'],
            data: [238.45, 239.78, 241.22, 240.56, 242.33, 243.56]
          },
          '1m': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [230.45, 235.67, 238.92, 243.56]
          },
          '3m': {
            labels: ['Jan', 'Feb', 'Mar'],
            data: [220.34, 234.56, 243.56]
          },
          '1y': {
            labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
            data: [205.67, 215.43, 208.95, 210.33, 220.56, 225.78, 219.43, 228.95, 235.67, 225.43, 234.78, 243.56]
          },
          'all': {
            labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
            data: [140.56, 175.23, 162.45, 190.78, 215.34, 243.56]
          }
        },
        news: [
          {
            id: 1,
            title: `${symbol} Announces New Product Line at Annual Conference`,
            source: 'TechCrunch',
            timestamp: '2025-03-12 03:15:22',
            summary: 'The company revealed its latest innovations to industry analysts and customers at its flagship event.',
            url: '#',
            sentiment: 'positive'
          },
          {
            id: 2,
            title: `${symbol} Reports Better Than Expected Quarterly Earnings`,
            source: 'Bloomberg',
            timestamp: '2025-03-11 14:45:11',
            summary: 'Revenue and profit exceeded analyst expectations, driven by strong growth in services and international markets.',
            url: '#',
            sentiment: 'positive'
          },
          {
            id: 3,
            title: `${symbol} Faces Regulatory Scrutiny in European Markets`,
            source: 'Reuters',
            timestamp: '2025-03-10 09:30:45',
            summary: 'EU regulators announce investigation into potential antitrust practices, but impact remains uncertain.',
            url: '#',
            sentiment: 'negative'
          }
        ]
      };
      
      setStockData(mockStock);
      setIsLoading(false);
    };
    
    fetchData();
  }, [symbol]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading stock data...</p>
        </div>
      </div>
    );
  }
  
  const isPositive = stockData.percentChange >= 0;
  
  // Prepare chart data based on selected timeframe
  const chartData = {
    labels: stockData.historicalData[timeframe].labels,
    datasets: [
      {
        label: stockData.symbol,
        data: stockData.historicalData[timeframe].data,
        borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Chart configuration
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
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    }
  };

  // Time frame options
  const timeframeOptions = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'ALL' },
  ];

  // Tab options
  const tabOptions = [
    { value: 'overview', label: 'Overview', icon: ChartBarIcon },
    { value: 'prediction', label: 'AI Prediction', icon: LightningBoltIcon },
    { value: 'news', label: 'News', icon: NewspaperIcon },
    { value: 'financials', label: 'Financials', icon: DocumentTextIcon },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stockData.symbol}</h1>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-md">
              NASDAQ
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{stockData.name}</p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">${stockData.price.toFixed(2)}</div>
          <div className={`flex items-center justify-end text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowSmUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ArrowSmDownIcon className="h-5 w-5 mr-1" />
            )}
            <span>
              {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            {timeframeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className={`px-3 py-1 text-sm rounded-md font-medium ${
                  timeframe === option.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>Last updated: 2025-03-12 05:50:21 UTC</span>
          </div>
        </div>
        
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {tabOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTab(option.value)}
                className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                  tab === option.value
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">${stockData.marketCap.toFixed(2)}T</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">P/E Ratio</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{stockData.pe.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">EPS</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">${stockData.eps.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Dividend Yield</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{stockData.dividend.toFixed(2)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Trading Information</h3>
                  <table className="min-w-full">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-2 text-sm text-gray-500 dark:text-gray-400">Open</td>
                        <td className="py-2 text-sm text-right text-gray-900 dark:text-white">${stockData.open.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-sm text-gray-500 dark:text-gray-400">Previous Close</td>
                        <td className="py-2 text-sm text-right text-gray-900 dark:text-white">${stockData.previousClose.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-sm text-gray-500 dark:text-gray-400">Day's Range</td>
                        <td className="py-2 text-sm text-right text-gray-900 dark:text-white">
                          ${Math.min(...stockData.historicalData['1d'].data).toFixed(2)} - ${Math.max(...stockData.historicalData['1d'].data).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-sm text-gray-500 dark:text-gray-400">52 Week Range</td>
                        <td className="py-2 text-sm text-right text-gray-900 dark:text-white">
                          ${stockData.low52w.toFixed(2)} - ${stockData.high52w.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-sm text-gray-500 dark:text-gray-400">Volume</td>
                        <td className="py-2 text-sm text-right text-gray-900 dark:text-white">{stockData.volume.toFixed(1)}M</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-sm text-gray-500 dark:text-gray-400">Avg. Volume</td>
                        <td className="py-2 text-sm text-right text-gray-900 dark:text-white">{stockData.avgVolume.toFixed(1)}M</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Analyst Recommendations</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div className="flex h-2.5 rounded-full">
                          <div 
                            className="bg-green-500 h-2.5 rounded-l-full" 
                            style={{ width: `${(stockData.analyst.buy / (stockData.analyst.buy + stockData.analyst.hold + stockData.analyst.sell)) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-yellow-500 h-2.5" 
                            style={{ width: `${(stockData.analyst.hold / (stockData.analyst.buy + stockData.analyst.hold + stockData.analyst.sell)) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-500 h-2.5 rounded-r-full" 
                            style={{ width: `${(stockData.analyst.sell / (stockData.analyst.buy + stockData.analyst.hold + stockData.analyst.sell)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{stockData.analyst.buy}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Buy</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{stockData.analyst.hold}</div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">Hold</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{stockData.analyst.sell}</div>
                        <div className="text-xs text-red-600 dark:text-red-400">Sell</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <p>Based on {stockData.analyst.buy + stockData.analyst.hold + stockData.analyst.sell} analyst ratings</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">AI Recommendation</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Our AI model predicts a {stockData.prediction.percentChange.toFixed(2)}% increase with {stockData.prediction.confidence}% confidence over the next {stockData.prediction.timeframe}. 
                    <a href="#" className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-500">Switch to AI Prediction tab for details.</a>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {tab === 'prediction' && (
            <StockPrediction prediction={stockData.prediction} />
          )}
          
          {tab === 'news' && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {stockData.news.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-4 px-4 py-2 rounded-md"
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{item.title}</h3>
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.source}</span>
                      <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <div className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        item.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' : 
                        item.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
                      }`}>
                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.summary}</p>
                  </a>
                </div>
              ))}
              
              <div className="mt-4 pt-4 text-center">
                <a href="#" className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                  Load more news
                </a>
              </div>
            </div>
          )}
          
          {tab === 'financials' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Financial Data Coming Soon</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                We're working on integrating comprehensive financial data including income statements, balance sheets, and cash flow statements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetail;