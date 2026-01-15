#!/bin/bash
set -e
echo "🚀 Building and starting frontend + backend"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$BASE_DIR/frontend"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_TARGET="/var/www/reactapp"

############################
# FRONTEND (React + Vite)
############################
echo "📦 Building frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "🧹 Removing old frontend files..."
sudo rm -rf "$FRONTEND_TARGET"/*

echo "📁 Copying new frontend build..."
sudo cp -r dist/* "$FRONTEND_TARGET/"
sudo chown -R www-data:www-data "$FRONTEND_TARGET"

############################
# BACKEND (Flask)
############################
echo "🐍 Setting up Flask backend..."
cd "$BACKEND_DIR"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv and install dependencies
echo "Installing dependencies..."

# Check for .env file
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found in backend directory"
    exit 1
fi

# Set production environment
export ENV=production

PORT=5050

echo "🔍 Looking for process on port $PORT..."

PID=$(lsof -ti tcp:$PORT)

if [ -z "$PID" ]; then
  echo "✅ No process is using port $PORT"
  exit 0
fi

echo "⚠️  Killing process(es): $PID"
kill -9 $PID

echo "💀 Port $PORT is now free"

# Start server with venv python
echo "Starting Flask server..."
nohup venv/bin/python server.py > backend.log 2>&1 &

echo "✅ Flask started on port 5050"

############################
# DONE
############################
echo "🎉 All done!"
echo "Frontend: https://react.hoi5.com"
echo "API: https://hak.hoi5.com/api/health"
