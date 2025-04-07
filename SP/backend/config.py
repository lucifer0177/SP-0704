import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Alpha Vantage API key
ALPHA_VANTAGE_API_KEY = os.environ.get('ALPHA_VANTAGE_API_KEY', 'demo')

# Finnhub API key (optional alternative)
FINNHUB_API_KEY = os.environ.get('FINNHUB_API_KEY', '')

# Polygon API key (optional alternative)
POLYGON_API_KEY = os.environ.get('POLYGON_API_KEY', '')

# Application settings
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
PORT = int(os.environ.get('PORT', 5000))