@echo off
REM BrandStudio Dashboard - Start Script for Windows
REM Flask application for managing dealership brands

echo.
echo ==========================================
echo   BrandStudio Dashboard (Python)
echo ==========================================
echo.

REM Check if Python is installed
py --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('py --version') do set PYTHON_VERSION=%%i
echo ✓ Python version: %PYTHON_VERSION%
echo.

REM Check if we're in the dashboard directory
if not exist "app.py" (
    echo ❌ app.py not found. Please run this script from the dashboard directory.
    pause
    exit /b 1
)

REM Check if venv exists
if not exist "venv" (
    echo 🐍 Creating virtual environment...
    py -m venv venv
    echo ✓ Virtual environment created
    echo.
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

REM Install/upgrade dependencies
if exist "requirements.txt" (
    echo 📦 Installing dependencies from requirements.txt...
    pip install -r requirements.txt
    echo ✓ Dependencies installed
    echo.
)

REM Start Flask app
echo 🚀 Starting BrandStudio Dashboard...
echo 📍 Access at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

py app.py

pause
