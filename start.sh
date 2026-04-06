#!/bin/bash

# BrandStudio Dashboard - Start Script for Windows Bash/WSL and Linux/macOS
# Flask application for managing dealership brands

set -e

echo "=========================================="
echo "  BrandStudio Dashboard (Python)"
echo "=========================================="
echo ""

# Detect if running on Windows (Git Bash, MSYS2, or WSL)

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    PYTHON_CMD="py"
    VENV_ACTIVATE="../venv/Scripts/activate"
    IS_WINDOWS=true
else
    PYTHON_CMD="python3"
    VENV_ACTIVATE="../venv/bin/activate"
    IS_WINDOWS=false
fi

# Check if Python is installed
if ! command -v $PYTHON_CMD &> /dev/null; then
    echo "❌ Python is not installed. Please install Python first."
    exit 1
fi

echo "✓ Python version: $($PYTHON_CMD --version)"
echo ""

# Check if venv exists one folder back
if [ ! -d "../venv" ]; then
    echo "🐍 Creating virtual environment in ../venv ..."
    $PYTHON_CMD -m venv ../venv
    echo "✓ Virtual environment created in ../venv"
    echo ""
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source $VENV_ACTIVATE
echo "✓ Virtual environment activated"
echo ""

# Install/upgrade dependencies
if [ -f "requirements.txt" ]; then
    echo "📦 Installing dependencies from requirements.txt..."
    pip install -r requirements.txt
    echo "✓ Dependencies installed"
    echo ""
fi

# Start Flask app with pm2
echo "🚀 Starting BrandStudio Dashboard with pm2..."
echo "📍 Access at: http://localhost:5000"
echo ""
echo "Use 'pm2 stop brandstudio' to stop the server"
echo ""

# Start or restart the app with pm2
if pm2 list | grep -q 'brandstudio'; then
    echo "🔄 Restarting existing pm2 process 'brandstudio'..."
    if ! pm2 restart brandstudio; then
        echo "⚠️  Restart failed, starting new pm2 process 'brandstudio'..."
        pm2 start app.py --interpreter $PYTHON_CMD --name brandstudio
    fi
else
    echo "🆕 Starting new pm2 process 'brandstudio'..."
    pm2 start app.py --interpreter $PYTHON_CMD --name brandstudio
fi

echo "✅ Server started with pm2. Exiting start.sh."
exit 0

