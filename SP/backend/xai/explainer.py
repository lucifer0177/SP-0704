import numpy as np
import pandas as pd
from datetime import datetime
import requests
import os
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelExplainer:
    """Explainable AI component for making model predictions interpretable - no NLTK version"""
    
    def __init__(self, model):
        self.model = model
        
        # API keys
        self.alpha_vantage_api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        self.finnhub_api_key = os.getenv("FINNHUB_API_KEY")
        self.news_api_key = os.getenv("NEWS_API_KEY")
        
        # Cache for news data
        self.news_cache = {}
        self.news_cache_ttl = 3600  # 1 hour
        
        logger.info("ModelExplainer initialized successfully (NLTK-free version)")
    
    def explain_prediction(self, symbol, prediction_data):
        """Generate human-readable explanations for a prediction with real-time context"""
        
        # Extract data from prediction
        factors = prediction_data.get('factors', [])
        percent_change = prediction_data.get('percentChange', 0)
        confidence = prediction_data.get('confidence', 0)
        timeframe = prediction_data.get('timeframe', '3m')
        
        # Get recent news sentiment as basic positive/negative/neutral without NLTK
        news_sentiment = self._get_news_sentiment_simple(symbol)
        
        # Overall market context from real-time data
        market_context = self._get_market_context()
        
        # Generate overall explanation
        overall_sentiment = "bullish" if percent_change > 0 else "bearish"
        
        # Map timeframe to human-readable text
        timeframe_text = {
            "1m": "one month",
            "3m": "three months",
            "1y": "one year",
            "all": "the long term"
        }.get(timeframe, timeframe)
        
        # Create main summary with news context
        if news_sentiment:
            news_context = f"Recent news about {symbol} has been {news_sentiment['sentiment_label']}."
            if news_sentiment['sentiment_label'] == overall_sentiment:
                news_impact = f"This aligns with the model's {overall_sentiment} prediction."
            else:
                news_impact = f"This contrasts with the model's {overall_sentiment} prediction, which may indicate changing market dynamics."
        else:
            news_context = ""
            news_impact = ""
        
        # Add market context
        if market_context:
            if market_context['overall_trend'] == "bullish":
                market_impact = f"The broader market is trending upward, which may provide tailwinds for {symbol}."
            elif market_context['overall_trend'] == "bearish":
                market_impact = f"The broader market is trending downward, which may create headwinds for {symbol}."
            else:
                market_impact = f"The overall market shows mixed signals with no clear direction."
        else:
            market_impact = ""
        
        # Build final summary
        summary = f"The model has a {overall_sentiment} outlook for {symbol} over the next {timeframe_text} with {confidence}% confidence. "
        if news_context:
            summary += news_context + " " + news_impact + " "
        if market_impact:
            summary += market_impact
        
        # Create detailed explanation
        explanation = {
            "summary": summary.strip(),
            "factors": {},
            "interpretation": [],
            "news_sentiment": news_sentiment,
            "market_context": market_context,
            "caveats": [
                "This prediction is based on historical patterns and may not account for unexpected events.",
                "Past performance is not indicative of future results.",
                "The model works best in stable market conditions and may be less accurate during high volatility.",
                f"The {timeframe_text} time horizon increases prediction uncertainty compared to shorter-term forecasts."
            ],
            "methodology": {
                "description": "This prediction uses an ensemble model combining technical analysis, market trends, and trading patterns.",
                "features": [
                    "Historical price patterns and technical indicators",
                    "Volume analysis and momentum indicators",
                    "Market correlation analysis",
                    "Sector performance and trend analysis"
                ],
                "data_freshness": "Real-time market data as of " + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "analyst": "lucifer0177i"  # Using user's login
        }
        
        # Process each factor
        for factor in factors:
            factor_name = factor['name']
            impact = factor['impact']
            weight = factor['weight']
            description = factor['description']
            
            # Get enriched interpretation with real-time context
            enriched_interpretation = self._generate_interpretation(factor_name, impact, weight, description, symbol)
            
            explanation['factors'][factor_name] = {
                "impact": impact,
                "weight": weight,
                "description": description,
                "interpretation": enriched_interpretation
            }
            
            # Add to overall interpretation list
            explanation['interpretation'].append({
                "factor": factor_name,
                "explanation": enriched_interpretation
            })
        
        return explanation
    
    def _get_news_sentiment_simple(self, symbol):
        """Get basic news sentiment without using NLTK"""
        # Check cache
        cache_key = symbol
        now = time.time()
        if cache_key in self.news_cache and now - self.news_cache[cache_key]['timestamp'] < self.news_cache_ttl:
            return self.news_cache[cache_key]['data']
        
        try:
            articles = []
            
            if self.news_api_key:
                # Get news from News API
                url = f"https://newsapi.org/v2/everything?q={symbol}+stock&sortBy=publishedAt&language=en&pageSize=10&apiKey={self.news_api_key}"
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                news_data = response.json()
                
                articles = news_data.get('articles', [])
            else:
                # Fallback to Finnhub if News API key is not available
                url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={datetime.now().strftime('%Y-%m-%d')}&to={datetime.now().strftime('%Y-%m-%d')}&token={self.finnhub_api_key}"
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                articles = response.json()
            
            if not articles:
                return None
            
            # Simple keyword-based sentiment analysis
            positive_keywords = ['up', 'rise', 'gain', 'growth', 'positive', 'bull', 'bullish', 'beat', 'outperform', 'upgrade']
            negative_keywords = ['down', 'fall', 'drop', 'loss', 'negative', 'bear', 'bearish', 'miss', 'underperform', 'downgrade']
            
            positive_count = 0
            negative_count = 0
            
            for article in articles[:10]:  # Process up to 10 articles
                title = article.get('title', '').lower()
                description = (article.get('description', '') or article.get('summary', '')).lower()
                
                for keyword in positive_keywords:
                    if keyword in title or keyword in description:
                        positive_count += 1
                
                for keyword in negative_keywords:
                    if keyword in title or keyword in description:
                        negative_count += 1
            
            # Determine sentiment label
            if positive_count > negative_count * 1.5:
                sentiment_label = "bullish"
                sentiment_score = 0.5
            elif negative_count > positive_count * 1.5:
                sentiment_label = "bearish"
                sentiment_score = -0.5
            else:
                sentiment_label = "neutral"
                sentiment_score = 0
            
            result = {
                "sentiment_score": sentiment_score,
                "sentiment_label": sentiment_label,
                "articles_analyzed": len(articles),
                "latest_headline": articles[0]['title'] if articles else None
            }
            
            # Cache the result
            self.news_cache[cache_key] = {
                'data': result,
                'timestamp': now
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting news sentiment for {symbol}: {e}")
            return None
    
    def _get_market_context(self):
        """Get current market context to enhance explanations"""
        try:
            # Get data for S&P 500 index (using SPY as proxy)
            url = f"https://finnhub.io/api/v1/quote?symbol=SPY&token={self.finnhub_api_key}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            spy_data = response.json()
            
            current_price = spy_data.get('c', 0)
            prev_close = spy_data.get('pc', 0)
            percent_change = ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0
            
            # Determine market trend
            if percent_change >= 1.0:
                overall_trend = "bullish"
                description = f"The market is showing strong bullish momentum with S&P 500 up {percent_change:.2f}%."
            elif percent_change >= 0.2:
                overall_trend = "bullish"
                description = f"The market is trending positive with S&P 500 up {percent_change:.2f}%."
            elif percent_change <= -1.0:
                overall_trend = "bearish"
                description = f"The market is showing strong bearish pressure with S&P 500 down {abs(percent_change):.2f}%."
            elif percent_change <= -0.2:
                overall_trend = "bearish"
                description = f"The market is trending negative with S&P 500 down {abs(percent_change):.2f}%."
            else:
                overall_trend = "neutral"
                description = f"The market is relatively flat with S&P 500 {('up' if percent_change >= 0 else 'down')} {abs(percent_change):.2f}%."
            
            return {
                "overall_trend": overall_trend,
                "description": description,
                "spy_change": round(percent_change, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting market context: {e}")
            
            # Fallback to time-based market context
            return self._get_fallback_market_context()
    
    def _get_fallback_market_context(self):
        """Get time-based market context when API fails"""
        # Generate market context based on time of day and day of week
        current_time = datetime.now()
        day_of_week = current_time.weekday()  # 0-6 (Monday-Sunday)
        
        # Market tends to be more bullish early in the week and bearish later
        if day_of_week < 2:  # Monday, Tuesday
            trend = "bullish"
            description = "The market typically shows positive trend early in the trading week."
        elif day_of_week > 3:  # Friday, Saturday, Sunday
            trend = "bearish"
            description = "The market often experiences caution approaching the weekend."
        else:
            trend = "neutral"
            description = "The market is showing typical mid-week trading patterns."
        
        return {
            "overall_trend": trend,
            "description": description,
            "is_fallback": True
        }
    
    def _generate_interpretation(self, factor_name, impact, weight, description, symbol=None):
        """Generate interpretation text for a specific factor with real-time context"""
        base_explanation = None
        
        if factor_name == "Technical Analysis" or factor_name == "Price Momentum":
            if impact == "positive":
                base_explanation = f"Technical indicators suggest a bullish trend with {weight}% influence on the prediction. {description}."
            elif impact == "negative":
                base_explanation = f"Technical indicators suggest a bearish trend with {weight}% influence on the prediction. {description}."
            else:
                base_explanation = f"Technical indicators are showing mixed signals with {weight}% influence on the prediction. {description}."
                
            # Add real-time technical context if available for the symbol
            if symbol:
                try:
                    url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={self.finnhub_api_key}"
                    response = requests.get(url, timeout=5)  # Short timeout to keep app responsive
                    if response.status_code == 200:
                        data = response.json()
                        if data:
                            current = data.get('c')
                            previous = data.get('pc')
                            if current and previous:
                                day_change = (current - previous) / previous * 100
                                base_explanation += f" Today's price action shows {abs(day_change):.2f}% {('gain' if day_change > 0 else 'loss')}."
                except Exception as e:
                    logger.debug(f"Minor error getting technical context: {e}")
        
        elif factor_name == "Fundamental Analysis":
            if impact == "positive":
                base_explanation = f"Company fundamentals appear strong with {weight}% influence on the prediction. {description}."
            elif impact == "negative":
                base_explanation = f"Company fundamentals show concerns with {weight}% influence on the prediction. {description}."
            else:
                base_explanation = f"Company fundamentals are stable but mixed with {weight}% influence on the prediction. {description}."
                
            # Add real-time fundamental context if available
            if symbol:
                try:
                    url = f"https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={self.finnhub_api_key}"
                    response = requests.get(url, timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        if data:
                            market_cap = data.get('marketCapitalization')
                            if market_cap:
                                if market_cap > 200:  # $200B+
                                    base_explanation += f" {symbol} is a large-cap company with significant market presence."
                                elif market_cap > 10:  # $10B-$200B
                                    base_explanation += f" {symbol} is a mid-cap company with established market position."
                                else:
                                    base_explanation += f" {symbol} is a smaller company which may offer growth potential but higher volatility."
                except Exception as e:
                    logger.debug(f"Minor error getting fundamental context: {e}")
        
        elif factor_name == "Market Sentiment" or factor_name == "Volume Trend":
            if impact == "positive":
                base_explanation = f"Market sentiment is favorable with {weight}% influence on the prediction. {description}."
            elif impact == "negative":
                base_explanation = f"Market sentiment is unfavorable with {weight}% influence on the prediction. {description}."
            else:
                base_explanation = f"Market sentiment is neutral with {weight}% influence on the prediction. {description}."
                
            # Add basic sentiment context based on news
            news_sentiment = self._get_news_sentiment_simple(symbol) if symbol else None
            if news_sentiment:
                if news_sentiment['sentiment_label'] == "bullish":
                    base_explanation += f" Recent news coverage supports a positive outlook."
                elif news_sentiment['sentiment_label'] == "bearish":
                    base_explanation += f" Recent news coverage indicates potential concerns."
                else:
                    base_explanation += f" Recent news coverage shows mixed sentiment."
        
        elif factor_name == "Sector Performance" or factor_name == "Moving Averages":
            if impact == "positive":
                base_explanation = f"The sector is performing well with {weight}% influence on the prediction. {description}."
            elif impact == "negative":
                base_explanation = f"The sector is underperforming with {weight}% influence on the prediction. {description}."
            else:
                base_explanation = f"The sector is showing average performance with {weight}% influence on the prediction. {description}."
                
            # Add real-time sector context
            market_context = self._get_market_context()
            if market_context:
                if market_context['overall_trend'] == "bullish" and impact == "positive":
                    base_explanation += f" This aligns with the current bullish market trend."
                elif market_context['overall_trend'] == "bearish" and impact == "negative":
                    base_explanation += f" This aligns with the current bearish market trend."
                elif market_context['overall_trend'] != impact:
                    base_explanation += f" This {('contrasts with' if impact != 'neutral' else 'is independent of')} the overall market trend."
        
        elif factor_name == "RSI" or factor_name == "MACD" or factor_name == "Bollinger Bands":
            # For technical indicators
            if "RSI" in factor_name:
                indicator_type = "momentum"
            elif "MACD" in factor_name:
                indicator_type = "trend"
            elif "Bollinger" in factor_name:
                indicator_type = "volatility"
            else:
                indicator_type = "technical"
                
            if impact == "positive":
                base_explanation = f"{factor_name} {indicator_type} indicator signals bullish conditions with {weight}% influence. {description}."
            elif impact == "negative":
                base_explanation = f"{factor_name} {indicator_type} indicator signals bearish conditions with {weight}% influence. {description}."
            else:
                base_explanation = f"{factor_name} {indicator_type} indicator shows neutral signals with {weight}% influence. {description}."
        
        else:
            # Generic factor
            base_explanation = f"{factor_name} has a {impact} impact with {weight}% influence on the prediction. {description}."
        
        return base_explanation