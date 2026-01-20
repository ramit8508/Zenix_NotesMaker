#!/bin/bash

echo "🚀 Starting Task Notepad..."
echo ""

# Check if dependencies are installed
if [ ! -d "Backend/node_modules" ]; then
    echo "📦 Installing Backend dependencies..."
    cd Backend
    npm install
    cd ..
fi

if [ ! -d "Frontend/node_modules" ]; then
    echo "📦 Installing Frontend dependencies..."
    cd Frontend
    npm install
    cd ..
fi

echo ""
echo "✅ Starting servers..."
echo "📊 Backend: http://localhost:5000"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start backend and frontend concurrently
cd Backend && npm start &
BACKEND_PID=$!

cd Frontend && npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
