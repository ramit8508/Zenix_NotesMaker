#!/bin/bash

# NotesMaker AppImage Build Script

set -e  # Exit on error

echo "🚀 Building NotesMaker AppImage..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js first:"
    echo "  sudo apt update && sudo apt install nodejs npm"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing Frontend dependencies..."
cd Frontend
npm install
cd ..

echo "📦 Installing Backend dependencies..."
cd Backend
npm install
cd ..

# Build Frontend
echo "🏗️  Building Frontend..."
npm run build:frontend

# Build AppImage
echo "🐧 Building AppImage..."
npm run dist:linux

echo ""
echo "✅ Build complete!"
echo "📁 AppImage location: $(pwd)/dist/"
echo ""
echo "To run the AppImage:"
echo "  chmod +x dist/NotesMaker-*.AppImage"
echo "  ./dist/NotesMaker-*.AppImage"
