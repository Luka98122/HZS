#!/usr/bin/env bash

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
