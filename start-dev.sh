#!/bin/bash

echo "🌾 AgriChain Finance - Starting Development Server"
echo "=================================================="
echo ""

# Check if node_modules exists in frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed!"
    echo ""
fi

echo "🚀 Starting frontend development server..."
echo "📱 Open your browser at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd frontend
npm run dev
