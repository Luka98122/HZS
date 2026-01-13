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
echo "🐍 Starting Flask backend..."

cd "$BACKEND_DIR"

# Stop previous server if running
pkill -f "python3 server.py" || true

nohup python3 server.py > backend.log 2>&1 &

echo "✅ Flask started on port 5050"

############################
# DONE
############################
echo "🎉 All done!"
echo "Frontend: https://react.hoi5.com"
echo "API: https://hak.hoi5.com/api/health"
