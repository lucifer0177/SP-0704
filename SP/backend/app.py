from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime
from api.routes import api_blueprint

app = Flask(__name__, static_folder='static')
CORS(app)

# Register blueprints
app.register_blueprint(api_blueprint, url_prefix='/api')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# API endpoints will be handled by the blueprint
# This catch-all route must be at the end to handle React routing
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # If the request is for an API route, don't handle it here
    if path.startswith('api/'):
        return {"error": "Not found"}, 404
    
    # Check if the requested file exists in static folder
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Otherwise return the React app's index.html
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)