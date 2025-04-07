import numpy as np
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PredictionService:
    """Service for generating stock price predictions using models"""
    
    def __init__(self, model):
        self.model = model
        self.prediction_cache = {}
        self.cache_expiry = {}
        
    def predict(self, symbol, timeframe='3m'):
        """Generate prediction for a stock over the specified timeframe"""
        cache_key = f"{symbol}_{timeframe}"
        current_time = datetime.now()
        
        # Check if we have a cached prediction that's still valid
        if cache_key in self.prediction_cache and cache_key in self.cache_expiry:
            if current_time < self.cache_expiry[cache_key]:
                # Return cached prediction if it's still valid
                return self.prediction_cache[cache_key]
        
        try:
            # Get prediction from model
            prediction_result = self.model.predict(symbol, timeframe)
            
            # Add metadata
            prediction_result["timestamp"] = current_time.strftime('%Y-%m-%d %H:%M:%S')
            prediction_result["updatedBy"] = "lucifer0177continue"
            
            # Cache prediction (valid for 1 hour)
            self.prediction_cache[cache_key] = prediction_result
            self.cache_expiry[cache_key] = current_time + timedelta(hours=1)
            
            return prediction_result
            
        except Exception as e:
            logger.error(f"Error generating prediction for {symbol}: {str(e)}")
            # If we have an expired cache entry, return it rather than failing
            if cache_key in self.prediction_cache:
                logger.info(f"Returning expired prediction for {symbol}")
                return self.prediction_cache[cache_key]
            # Otherwise, raise the exception
            raise