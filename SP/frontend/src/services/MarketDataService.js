/**
 * Market Data Service
 * Handles all API calls to the backend for stock market data
 */
class MarketDataService {
    constructor() {
      this.currentDate = new Date("2025-04-03 07:12:05"); // Updated with the latest timestamp
      this.currentUser = "lucifer0177continue"; // Updated username
    }
  
    /**
     * Search for stocks by query string
     * @param {string} query - Search term
     * @param {number} limit - Maximum number of results to return
     * @returns {Promise} - Promise resolving to search results
     */
    async searchStocks(query, limit = 10) {
      try {
        const response = await fetch(`/api/stocks?query=${encodeURIComponent(query)}&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error('Error searching stocks:', error);
        throw error;
      }
    }
  
    /**
     * Get detailed information for a specific stock
     * @param {string} symbol - Stock symbol
     * @returns {Promise} - Promise resolving to stock details
     */
    async getStockDetails(symbol) {
      try {
        const response = await fetch(`/api/stocks/${symbol}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching details for ${symbol}:`, error);
        throw error;
      }
    }
  
    /**
     * Get historical price data for a stock
     * @param {string} symbol - Stock symbol
     * @param {string} timeframe - Time period (1d, 1w, 1m, 3m, 1y, all)
     * @returns {Promise} - Promise resolving to historical data
     */
    async getHistoricalData(symbol, timeframe = '1m') {
      try {
        const response = await fetch(`/api/stocks/${symbol}/historical?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
      }
    }
  
    /**
     * Get price prediction for a stock
     * @param {string} symbol - Stock symbol
     * @param {string} timeframe - Prediction timeframe
     * @returns {Promise} - Promise resolving to prediction data
     */
    async getPrediction(symbol, timeframe = '3m') {
      try {
        const response = await fetch(`/api/stocks/${symbol}/predict?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching prediction for ${symbol}:`, error);
        throw error;
      }
    }
  
    /**
     * Get market summary data
     * @returns {Promise} - Promise resolving to market summary
     */
    async getMarketSummary() {
      try {
        const response = await fetch('/api/market/summary');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching market summary:', error);
        throw error;
      }
    }
  
    /**
     * Get market movers (top gainers and losers)
     * @param {number} limit - Maximum number of results per category
     * @returns {Promise} - Promise resolving to market movers data
     */
    async getMarketMovers(limit = 5) {
      try {
        const response = await fetch(`/api/market/movers?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching market movers:', error);
        throw error;
      }
    }
  
    /**
     * Get most watched stocks
     * @param {number} limit - Maximum number of results
     * @returns {Promise} - Promise resolving to most watched stocks
     */
    async getMostWatched(limit = 5) {
      try {
        const response = await fetch(`/api/market/most-watched?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching most watched stocks:', error);
        throw error;
      }
    }
  
    /**
     * Format a timestamp to human-readable format
     * @param {string} timestamp - ISO timestamp string
     * @returns {string} - Formatted time string
     */
    formatTimestamp(timestamp) {
      if (!timestamp) return 'Unknown';
      
      try {
        const date = new Date(timestamp);
        return date.toLocaleString();
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return timestamp;
      }
    }
  
    /**
     * Calculate time difference between now and timestamp
     * @param {string} timestamp - ISO timestamp string
     * @returns {string} - Human-readable time difference
     */
    getTimeSince(timestamp) {
      if (!timestamp) return 'Unknown';
      
      try {
        const now = this.currentDate; // Use the updated timestamp
        const then = new Date(timestamp);
        const diffMs = now - then;
        
        // Convert to seconds, minutes, hours, days
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);
        
        if (diffDays > 0) {
          return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHrs > 0) {
          return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
        } else if (diffMin > 0) {
          return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else {
          return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
        }
      } catch (error) {
        console.error('Error calculating time difference:', error);
        return 'Unknown';
      }
    }
  }
  
  export default new MarketDataService();