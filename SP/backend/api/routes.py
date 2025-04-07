from flask import Blueprint, jsonify, request
from services.stock_service import StockService
from services.prediction_service import PredictionService
from models.prediction_model import PredictionModel
from xai.explainer import ModelExplainer
from datetime import datetime

api_blueprint = Blueprint('api', __name__)
stock_service = StockService()
prediction_model = PredictionModel()
prediction_service = PredictionService(prediction_model)
model_explainer = ModelExplainer(prediction_model)

@api_blueprint.route('/stocks', methods=['GET'])
def get_stocks():
    """Get a list of stocks based on query parameters"""
    query = request.args.get('query', '')
    limit = request.args.get('limit', 10, type=int)
    
    try:
        stocks = stock_service.search_stocks(query, limit)
        return jsonify({
            'success': True,
            'data': stocks
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_blueprint.route('/stocks/<string:symbol>', methods=['GET'])
def get_stock_details(symbol):
    """Get detailed information about a specific stock"""
    try:
        details = stock_service.get_stock_details(symbol)
        return jsonify({
            'success': True,
            'data': details
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_blueprint.route('/stocks/<string:symbol>/historical', methods=['GET'])
def get_historical_data(symbol):
    """Get historical price data for a stock"""
    timeframe = request.args.get('timeframe', '1m')
    
    try:
        data = stock_service.get_historical_data(symbol, timeframe)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_blueprint.route('/stocks/<string:symbol>/predict', methods=['GET'])
def predict_stock(symbol):
    """Get prediction for a stock with XAI explanations"""
    timeframe = request.args.get('timeframe', '3m')
    
    try:
        # Get prediction
        prediction = prediction_service.predict(symbol, timeframe)
        
        # Get explanation
        explanation = model_explainer.explain_prediction(symbol, prediction)
        
        return jsonify({
            'success': True,
            'data': {
                'prediction': prediction,
                'explanation': explanation
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_blueprint.route('/market/summary', methods=['GET'])
def get_market_summary():
    """Get summary of the overall market"""
    try:
        summary = stock_service.get_market_summary()
        return jsonify({
            'success': True,
            'data': summary
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_blueprint.route('/market/movers', methods=['GET'])
def get_market_movers():
    """Get top gainers and losers in the market"""
    limit = request.args.get('limit', 5, type=int)
    
    try:
        movers = stock_service.get_market_movers(limit)
        return jsonify({
            'success': True,
            'data': movers
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_blueprint.route('/market/most-watched', methods=['GET'])
def get_most_watched():
    """Get most watched stocks"""
    limit = request.args.get('limit', 5, type=int)
    
    try:
        watched = stock_service.get_most_watched(limit)
        return jsonify({
            'success': True,
            'data': watched
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    

@api_blueprint.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    # Check if we can access stock data
    try:
        # Try to get Apple stock details as a basic test
        stock_data = stock_service.get_stock_details("AAPL")
        api_status = "ok" if stock_data and "price" in stock_data else "degraded"
    except Exception:
        api_status = "error"
        
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "api_status": api_status
    })   