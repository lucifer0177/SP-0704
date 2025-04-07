import pandas as pd
import numpy as np
import os
import time
import threading
import yfinance as yf
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
import random
import backoff

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('StockService')

# Load environment variables
load_dotenv()

class StockService:
    """Service for interacting with stock market data sources using yfinance"""
    
    def __init__(self):
        # Initialize cache with different TTLs for different data types
        self.cache = {
            'realtime': {},
            'historical': {},
            'search': {},
            'market': {}
        }
        self.cache_ttl = {
            'realtime': 30,      # 30 seconds for real-time data
            'historical': 3600,  # 1 hour for historical data
            'search': 3600,      # 1 hour for search results
            'market': 60         # 60 seconds for market data
        }
        
        # Thread lock for database operations
        self.lock = threading.Lock()
        
        # Start cache cleanup thread
        self._start_cleanup_thread()
        
        # Popular stock symbols for search results
        self.popular_stocks = [
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "MSFT", "name": "Microsoft Corporation"},
            {"symbol": "GOOGL", "name": "Alphabet Inc."},
            {"symbol": "AMZN", "name": "Amazon.com Inc."},
            {"symbol": "META", "name": "Meta Platforms Inc."},
            {"symbol": "TSLA", "name": "Tesla Inc."},
            {"symbol": "NVDA", "name": "NVIDIA Corporation"},
            {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
            {"symbol": "V", "name": "Visa Inc."},
            {"symbol": "JNJ", "name": "Johnson & Johnson"}
        ]
        
    def _start_cleanup_thread(self):
        """Start a background thread to clean up expired cache"""
        def cleanup_task():
            while True:
                time.sleep(300)  # Run every 5 minutes
                self._cleanup_cache()
        
        thread = threading.Thread(target=cleanup_task, daemon=True)
        thread.start()
    
    def _cleanup_cache(self):
        """Remove expired entries from cache"""
        now = time.time()
        with self.lock:
            for cache_type, cache_data in self.cache.items():
                expired_keys = [
                    key for key, value in cache_data.items() 
                    if now - value['timestamp'] > self.cache_ttl[cache_type]
                ]
                for key in expired_keys:
                    if key in cache_data:
                        del cache_data[key]
    
    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def search_stocks(self, query, limit=10):
        """Search for stocks based on a query string with retry logic"""
        if not query:
            # Return popular stocks if no query
            return self.popular_stocks[:limit]
        
        # Check cache first
        cache_key = f"search_{query}_{limit}"
        now = time.time()
        
        with self.lock:
            if cache_key in self.cache['search'] and now - self.cache['search'][cache_key]['timestamp'] < self.cache_ttl['search']:
                return self.cache['search'][cache_key]['data']
        
        try:
            # Use yfinance tickers search
            tickers = yf.Tickers(query)
            
            # If direct match failed, try searching with Yahoo Finance's search functionality
            if not hasattr(tickers, 'tickers') or not tickers.tickers:
                # Unfortunately yfinance doesn't have a direct search function
                # We'll try a few variations of the query with common stock symbols
                variations = [
                    query.upper(),  # Try exact uppercase match
                    query.upper() + ".TO",  # Try Toronto exchange
                    query.upper() + ".L",   # Try London exchange
                ]
                
                results = []
                for var in variations:
                    try:
                        ticker = yf.Ticker(var)
                        info = ticker.info
                        if 'shortName' in info:
                            results.append({
                                "symbol": var,
                                "name": info['shortName']
                            })
                    except Exception as e:
                        logger.debug(f"Error searching ticker {var}: {e}")
                        
                if not results:
                    # If no results found, filter popular stocks by query
                    results = [
                        stock for stock in self.popular_stocks 
                        if query.lower() in stock['symbol'].lower() or query.lower() in stock['name'].lower()
                    ]
            else:
                # Process direct tickers match
                results = []
                for symbol, ticker in tickers.tickers.items():
                    try:
                        info = ticker.info
                        if 'shortName' in info:
                            results.append({
                                "symbol": symbol,
                                "name": info['shortName']
                            })
                    except Exception as e:
                        logger.debug(f"Error getting info for {symbol}: {e}")
                        # If we can't get the info, just use the symbol
                        results.append({
                            "symbol": symbol,
                            "name": f"{symbol} Inc."
                        })
            
            # Cache the results
            with self.lock:
                self.cache['search'][cache_key] = {
                    'data': results[:limit],
                    'timestamp': now
                }
            
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
            # If search fails, filter popular stocks by query
            results = [
                stock for stock in self.popular_stocks 
                if query.lower() in stock['symbol'].lower() or query.lower() in stock['name'].lower()
            ]
            return results[:limit]
    
    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def get_stock_details(self, symbol):
        """Get detailed real-time information about a specific stock"""
        # Check cache first
        cache_key = f"details_{symbol}"
        now = time.time()
        
        with self.lock:
            if cache_key in self.cache['realtime'] and now - self.cache['realtime'][cache_key]['timestamp'] < self.cache_ttl['realtime']:
                return self.cache['realtime'][cache_key]['data']
        
        try:
            # Add a small random delay to avoid hitting rate limits and database locks
            time.sleep(random.uniform(0.1, 0.5))
            
            # Get stock information from yfinance
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Get recent market data
            hist = ticker.history(period="2d")
            
            # Calculate changes
            if len(hist) >= 2:
                current_price = hist['Close'].iloc[-1]
                prev_close = hist['Close'].iloc[-2]
                change = current_price - prev_close
                percent_change = (change / prev_close * 100) if prev_close > 0 else 0
            else:
                current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
                prev_close = info.get('previousClose', current_price)
                change = current_price - prev_close
                percent_change = (change / prev_close * 100) if prev_close > 0 else 0
            
            # Get analyst recommendations
            # Handle safely to avoid 'To Grade' errors
            analyst = {"buy": 0, "hold": 0, "sell": 0}
            
            try:
                recommendations = ticker.recommendations
                
                if recommendations is not None and not recommendations.empty:
                    recent_recs = recommendations.tail(10)  # Last 10 recommendations
                    
                    # Check if 'To Grade' column exists
                    if 'To Grade' in recent_recs.columns:
                        for grade in recent_recs['To Grade']:
                            if pd.isna(grade):  # Skip NaN values
                                continue
                                
                            grade_lower = str(grade).lower()
                            if 'buy' in grade_lower or 'outperform' in grade_lower or 'overweight' in grade_lower:
                                analyst["buy"] += 1
                            elif 'hold' in grade_lower or 'neutral' in grade_lower or 'market perform' in grade_lower:
                                analyst["hold"] += 1
                            elif 'sell' in grade_lower or 'underperform' in grade_lower or 'underweight' in grade_lower:
                                analyst["sell"] += 1
            except Exception as e:
                logger.debug(f"Error processing recommendations for {symbol}: {e}")
                # Use default analyst values set above
            
            # Process additional data
            market_cap = info.get('marketCap', 0) / 1e12  # in trillions
            pe = info.get('trailingPE', info.get('forwardPE', 0))
            eps = info.get('trailingEps', 0)
            dividend = info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0  # as percentage
            
            result = {
                "symbol": symbol,
                "name": info.get('shortName', f"{symbol} Corp"),
                "price": current_price,
                "change": change,
                "percentChange": percent_change,
                "marketCap": round(market_cap, 2),
                "volume": round(info.get('volume', 0) / 1e6, 1),  # Volume in millions
                "avgVolume": round(info.get('averageVolume', 0) / 1e6, 1),
                "pe": round(pe, 1) if pe else 0,
                "eps": round(eps, 2) if eps else 0,
                "dividend": round(dividend, 2),
                "high52w": info.get('fiftyTwoWeekHigh', 0),
                "low52w": info.get('fiftyTwoWeekLow', 0),
                "open": info.get('open', 0),
                "previousClose": prev_close,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "analyst": analyst
            }
            
            # Cache the result
            with self.lock:
                self.cache['realtime'][cache_key] = {
                    'data': result,
                    'timestamp': now
                }
            
            return result
        
        except Exception as e:
            logger.error(f"Error getting stock details for {symbol}: {e}")
            # If API calls fail, try cached data before returning failure
            with self.lock:
                if cache_key in self.cache['realtime']:
                    logger.info(f"Using cached data for {symbol}")
                    return self.cache['realtime'][cache_key]['data']
            
            # If no cache, return basic mock data
            return {
                "symbol": symbol,
                "name": f"{symbol} Corporation",
                "price": 100.0,
                "change": 0.0,
                "percentChange": 0.0,
                "marketCap": 0.0,
                "volume": 0.0,
                "avgVolume": 0.0,
                "pe": 0.0,
                "eps": 0.0,
                "dividend": 0.0,
                "high52w": 100.0,
                "low52w": 100.0,
                "open": 100.0,
                "previousClose": 100.0,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "analyst": {"buy": 0, "hold": 0, "sell": 0}
            }
    
    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def get_historical_data(self, symbol, timeframe='1m'):
        """Get historical price data with Yahoo Finance"""
        # Check cache first
        cache_key = f"historical_{symbol}_{timeframe}"
        now = time.time()
        
        with self.lock:
            if cache_key in self.cache['historical'] and now - self.cache['historical'][cache_key]['timestamp'] < self.cache_ttl['historical']:
                return self.cache['historical'][cache_key]['data']
        
        try:
            # Add a small random delay to avoid hitting rate limits and database locks
            time.sleep(random.uniform(0.1, 0.5))
            
            # Map timeframe to yfinance parameters
            if timeframe == '1d':
                period = "1d"
                interval = "5m"
                date_format = '%H:%M'
            elif timeframe == '1w':
                period = "1wk"
                interval = "1h"
                date_format = '%a'
            elif timeframe == '1m':
                period = "1mo"
                interval = "1d"
                date_format = '%d'
            elif timeframe == '3m':
                period = "3mo"
                interval = "1d"
                date_format = '%b %d'
            elif timeframe == '1y':
                period = "1y"
                interval = "1wk"
                date_format = '%b'
            else:  # 'all' or default
                period = "max"
                interval = "1mo"
                date_format = '%Y'
            
            # Get data from yfinance
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                raise ValueError(f"No historical data returned for {symbol}")
            
            # Convert to lists for JSON
            timestamps = hist.index.tolist()
            prices = hist['Close'].tolist()
            
            # Format dates
            if isinstance(timestamps[0], pd.Timestamp):
                dates = [ts.strftime('%Y-%m-%d') for ts in timestamps]
                labels = [ts.strftime(date_format) for ts in timestamps]
            else:
                # If timestamps are already strings
                dates = timestamps
                labels = timestamps
            
            result = {
                "symbol": symbol,
                "timeframe": timeframe,
                "labels": labels,
                "data": [round(price, 2) if not pd.isna(price) else None for price in prices],
                "timestamps": dates,
                "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "updated_by": "lucifer0177"
            }
            
            # Cache the result
            with self.lock:
                self.cache['historical'][cache_key] = {
                    'data': result,
                    'timestamp': now
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            # If API calls fail, try cached data before failing
            with self.lock:
                if cache_key in self.cache['historical']:
                    logger.info(f"Using cached historical data for {symbol}")
                    return self.cache['historical'][cache_key]['data']
            
            # Return mock data if no cache
            return self._get_mock_historical_data(symbol, timeframe)
    
    def _get_mock_historical_data(self, symbol, timeframe='1m'):
        """Generate mock historical data when API fails"""
        # Map timeframe to parameters
        if timeframe == '1d':
            days = 1
            points = 24
            date_format = '%H:%M'
        elif timeframe == '1w':
            days = 7
            points = 7
            date_format = '%a'
        elif timeframe == '1m':
            days = 30
            points = 30
            date_format = '%d'
        elif timeframe == '3m':
            days = 90
            points = 12
            date_format = '%b %d'
        elif timeframe == '1y':
            days = 365
            points = 52
            date_format = '%b'
        else:  # 'all'
            days = 1825  # 5 years
            points = 60
            date_format = '%Y'
        
        # Create timestamps
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        timestamps = pd.date_range(start=start_date, end=end_date, periods=points)
        
        # Create mock price data
        np.random.seed(hash(symbol) % 10000)
        start_price = np.random.uniform(50, 500)
        volatility = np.random.uniform(0.01, 0.05)
        returns = np.random.normal(0, volatility, points)
        prices = [start_price]
        
        for ret in returns[1:]:
            prices.append(prices[-1] * (1 + ret))
        
        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "labels": [ts.strftime(date_format) for ts in timestamps],
            "data": [round(price, 2) for price in prices],
            "timestamps": [ts.strftime("%Y-%m-%d") for ts in timestamps],
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "updated_by": "mock_data"
        }
    
    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def get_market_summary(self):
        """Get market summary data using yfinance"""
        # Check cache first
        cache_key = "market_summary"
        now = time.time()
        
        with self.lock:
            if cache_key in self.cache['market'] and now - self.cache['market'][cache_key]['timestamp'] < self.cache_ttl['market']:
                return self.cache['market'][cache_key]['data']
        
        try:
            # Major indices with their Yahoo Finance symbols
            indices_symbols = {
                "S&P 500": "^GSPC", 
                "Dow Jones": "^DJI", 
                "Nasdaq": "^IXIC", 
                "Russell 2000": "^RUT"
            }
            
            # Sector ETFs to track sector performance
            sector_symbols = {
                "Technology": "XLK",
                "Healthcare": "XLV",
                "Financials": "XLF",
                "Consumer Discretionary": "XLY",
                "Communication Services": "XLC",
                "Industrials": "XLI",
                "Energy": "XLE",
                "Utilities": "XLU",
                "Materials": "XLB",
                "Real Estate": "XLRE"
            }
            
            # Get data for indices
            indices_data = []
            for name, symbol in indices_symbols.items():
                try:
                    # Add a small random delay to avoid hitting rate limits and database locks
                    time.sleep(random.uniform(0.1, 0.3))
                    
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="2d")
                    
                    if len(hist) >= 2:
                        current_price = hist['Close'].iloc[-1]
                        prev_close = hist['Close'].iloc[-2]
                        change = current_price - prev_close
                        percent_change = (change / prev_close * 100) if prev_close > 0 else 0
                        
                        indices_data.append({
                            "name": name,
                            "value": round(current_price, 2),
                            "change": round(change, 2),
                            "percentChange": round(percent_change, 2)
                        })
                except Exception as e:
                    logger.error(f"Error getting data for index {name}: {e}")
            
            # Get data for sectors
            sector_performance = []
            for name, symbol in sector_symbols.items():
                try:
                    # Add a small random delay to avoid hitting rate limits and database locks
                    time.sleep(random.uniform(0.1, 0.3))
                    
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="2d")
                    
                    if len(hist) >= 2:
                        current_price = hist['Close'].iloc[-1]
                        prev_close = hist['Close'].iloc[-2]
                        percent_change = ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0
                        
                        sector_performance.append({
                            "name": name,
                            "percentChange": round(percent_change, 2)
                        })
                except Exception as e:
                    logger.error(f"Error getting data for sector {name}: {e}")
            
            # Determine market status
            market_status = self._get_market_status()
            
            result = {
                "indices": indices_data,
                "sectorPerformance": sector_performance,
                "marketStatus": market_status,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "updatedBy": "lucifer0177"
            }
            
            # Cache the result
            with self.lock:
                self.cache['market'][cache_key] = {
                    'data': result,
                    'timestamp': now
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching market summary: {e}")
            # If API call fails, try cached data
            with self.lock:
                if cache_key in self.cache['market']:
                    logger.info("Using cached market summary data")
                    return self.cache['market'][cache_key]['data']
            
            # If no cache, return mock data
            return self._get_mock_market_summary()
    
    def _get_market_status(self):
        """Determine if the market is currently open"""
        now = datetime.now()
        weekday = now.weekday()  # 0-6 (Mon-Sun)
        
        # US market hours: 9:30 AM to 4:00 PM Eastern Time
        if weekday < 5:  # Monday to Friday
            # Convert current time to Eastern Time (rough approximation)
            # Properly, you'd use pytz or equivalent
            eastern_hour = (now.hour - 4) % 24  # UTC-4 for Eastern Time
            
            if 9 <= eastern_hour < 16 or (eastern_hour == 9 and now.minute >= 30):
                return "open"
            
        return "closed"
    
    def _get_mock_market_summary(self):
        """Return mock market summary data"""
        return {
            "indices": [
                {"name": "S&P 500", "value": 5280.14, "change": 42.32, "percentChange": 0.81},
                {"name": "Dow Jones", "value": 38905.66, "change": 156.87, "percentChange": 0.40},
                {"name": "Nasdaq", "value": 16742.39, "change": -23.87, "percentChange": -0.14},
                {"name": "Russell 2000", "value": 2082.75, "change": 10.43, "percentChange": 0.50}
            ],
            "sectorPerformance": [
                {"name": "Technology", "percentChange": 1.53},
                {"name": "Healthcare", "percentChange": 0.87},
                {"name": "Financials", "percentChange": -0.42},
                {"name": "Consumer Discretionary", "percentChange": 1.12},
                {"name": "Communication Services", "percentChange": -0.23},
                {"name": "Industrials", "percentChange": 0.67},
                {"name": "Energy", "percentChange": -1.32},
                {"name": "Utilities", "percentChange": 0.35},
                {"name": "Materials", "percentChange": 0.12},
                {"name": "Real Estate", "percentChange": -0.65}
            ],
            "marketStatus": "closed",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "updatedBy": "mock_data"
        }
    
    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def get_market_movers(self, limit=5):
        """Get market movers (top gainers and losers) using yfinance"""
        # Check cache
        cache_key = f"movers_{limit}"
        now = time.time()
        
        with self.lock:
            if cache_key in self.cache['market'] and now - self.cache['market'][cache_key]['timestamp'] < self.cache_ttl['market']:
                return self.cache['market'][cache_key]['data']
        
        try:
            # Get list of most active stocks
            # We'll use a list of major stocks to check their performance
            major_stocks = [
                "AAPL", "MSFT", "GOOGL", "AMZN", "META",
                "TSLA", "NVDA", "JPM", "V", "JNJ",
                "PG", "UNH", "HD", "BAC", "MA",
                "DIS", "ADBE", "CRM", "NFLX", "INTC"
            ]
            
            stock_data = []
            for symbol in major_stocks:
                try:
                    # Add a small random delay to avoid hitting rate limits and database locks
                    time.sleep(random.uniform(0.1, 0.3))
                    
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="2d")
                    info = ticker.info
                    
                    if len(hist) >= 2:
                        current_price = hist['Close'].iloc[-1]
                        prev_close = hist['Close'].iloc[-2]
                        change = current_price - prev_close
                        percent_change = (change / prev_close * 100) if prev_close > 0 else 0
                        
                        stock_data.append({
                            "symbol": symbol,
                            "name": info.get('shortName', f"{symbol} Inc."),
                            "price": round(current_price, 2),
                            "change": round(change, 2),
                            "percentChange": round(percent_change, 2)
                        })
                except Exception as e:
                    logger.error(f"Error getting data for {symbol}: {e}")
            
            # Sort by percent change
            gainers = sorted(stock_data, key=lambda x: x['percentChange'], reverse=True)[:limit]
            losers = sorted(stock_data, key=lambda x: x['percentChange'])[:limit]
            
            result = {
                "gainers": gainers,
                "losers": losers,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "updatedBy": "lucifer0177"
            }
            
            # Cache the result
            with self.lock:
                self.cache['market'][cache_key] = {
                    'data': result,
                    'timestamp': now
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching market movers: {e}")
            # If API calls fail, try cached data
            with self.lock:
                if cache_key in self.cache['market']:
                    logger.info("Using cached market movers data")
                    return self.cache['market'][cache_key]['data']
            
            # If no cache, return mock data
            return {
                "gainers": [
                    {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": 950.37, "change": 48.78, "percentChange": 5.42},
                    {"symbol": "TSLA", "name": "Tesla Inc", "price": 178.22, "change": 6.50, "percentChange": 3.78},
                    {"symbol": "AAPL", "name": "Apple Inc", "price": 243.56, "change": 3.21, "percentChange": 1.34},
                    {"symbol": "AMZN", "name": "Amazon.com Inc", "price": 181.75, "change": 1.92, "percentChange": 1.07},
                    {"symbol": "GOOGL", "name": "Alphabet Inc", "price": 187.63, "change": 1.75, "percentChange": 0.94}
                ],
                "losers": [
                    {"symbol": "META", "name": "Meta Platforms Inc", "price": 475.12, "change": -12.10, "percentChange": -2.48},
                    {"symbol": "JPM", "name": "JPMorgan Chase & Co", "price": 178.92, "change": -3.38, "percentChange": -1.85},
                    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 420.87, "change": -2.53, "percentChange": -0.60},
                    {"symbol": "JNJ", "name": "Johnson & Johnson", "price": 147.62, "change": -0.75, "percentChange": -0.51},
                    {"symbol": "V", "name": "Visa Inc", "price": 298.45, "change": -1.02, "percentChange": -0.34}
                ],
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "updatedBy": "mock_data"
            }
    
    def get_most_watched(self, limit=5):
        """Get most watched/popular stocks"""
        # In a real app, this would be based on user activity
        # For now, return data for popular tech stocks
        popular_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"]
        
        try:
            watched = []
            for symbol in popular_symbols[:limit]:
                try:
                    # Add a small random delay to avoid hitting rate limits and database locks
                    time.sleep(random.uniform(0.1, 0.3))
                    
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="2d")
                    info = ticker.info
                    
                    if len(hist) >= 2:
                        current_price = hist['Close'].iloc[-1]
                        prev_close = hist['Close'].iloc[-2]
                        change = current_price - prev_close
                        percent_change = (change / prev_close * 100) if prev_close > 0 else 0
                        
                        watched.append({
                            "symbol": symbol,
                            "name": info.get('shortName', f"{symbol} Inc."),
                            "price": round(current_price, 2),
                            "change": round(change, 2),
                            "percentChange": round(percent_change, 2)
                        })
                except Exception as e:
                    logger.error(f"Error getting details for {symbol}: {e}")
            
            return {
                "stocks": watched[:limit],
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "updatedBy": "lucifer0177"
            }
            
        except Exception as e:
            logger.error(f"Error fetching most watched: {e}")
            
            # Return mock data on error
            return {
                "stocks": [
                    {"symbol": "AAPL", "name": "Apple Inc.", "price": 243.56, "change": 3.21, "percentChange": 1.34},
                    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 420.87, "change": -2.53, "percentChange": -0.60},
                    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 187.63, "change": 1.75, "percentChange": 0.94},
                    {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 181.75, "change": 1.92, "percentChange": 1.07},
                    {"symbol": "TSLA", "name": "Tesla Inc.", "price": 178.22, "change": 6.50, "percentChange": 3.78}
                ],
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "updatedBy": "mock_data"
            }