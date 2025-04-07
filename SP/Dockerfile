# Use a specific Node.js image to build the frontend
FROM node:16-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /frontend_build

# Copy package.json first for better caching
COPY frontend/package*.json ./

# Fix the Tailwind version
RUN sed -i 's/"tailwindcss": "\^4.0.13"/"tailwindcss": "\^3.3.2"/' package.json

# Install frontend dependencies
RUN npm install

# Copy frontend files
COPY frontend/ ./

# Create the directories that might be missing
RUN mkdir -p src/pages src/components/common src/components/stocks

# Create properly formatted index.css file for Tailwind
RUN echo '@tailwind base;' > src/index.css && \
    echo '@tailwind components;' >> src/index.css && \
    echo '@tailwind utilities;' >> src/index.css

# Create a tailwind.config.js file
RUN echo 'module.exports = {' > tailwind.config.js && \
    echo '  content: ["./src/**/*.{js,jsx}"],' >> tailwind.config.js && \
    echo '  darkMode: "class",' >> tailwind.config.js && \
    echo '  theme: { extend: {} },' >> tailwind.config.js && \
    echo '  plugins: []' >> tailwind.config.js && \
    echo '}' >> tailwind.config.js

# Build Tailwind CSS
RUN npx tailwindcss -i src/index.css -o src/styles.css

# Install react-scripts and build React app
RUN npm install -g react-scripts && \
    CI=false npm run build

# Now switch to Python for the backend
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# First install a compatible version of Werkzeug explicitly
RUN pip install Werkzeug==2.0.3

# Copy backend requirements
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Fix the protobuf version issue
RUN pip uninstall -y protobuf && \
    pip install protobuf==3.20.0

# Set environment variable as an alternative fix
ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

# Copy backend code
COPY backend/ /app/

# Create a static folder and copy the built frontend
RUN mkdir -p /app/static
COPY --from=frontend-build /frontend_build/build/* /app/static/

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

EXPOSE 5000

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers=4", "app:app"]