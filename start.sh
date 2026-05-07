#!/bin/bash

# BrandStudio Dashboard - Start Script for Windows Bash/WSL and Linux/macOS
# Flask application for managing dealership brands

set -e

echo "=========================================="
echo "  BrandStudio Dashboard (Python)"
echo "=========================================="
echo ""

# Pinned to Python 3.12 — Pillow 10.1.0 and cryptography 42.0.8 only ship
# wheels through 3.12. Override with: BRANDSTUDIO_PY=python3.13 ./start.sh
# (only do this if you've bumped the deps to versions with matching wheels).

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    PYTHON_CMD="${BRANDSTUDIO_PY:-py -3.12}"
    VENV_ACTIVATE="../venv/Scripts/activate"
    IS_WINDOWS=true
else
    PYTHON_CMD="${BRANDSTUDIO_PY:-python3.12}"
    VENV_ACTIVATE="../venv/bin/activate"
    IS_WINDOWS=false
fi

# Sanity-check the chosen interpreter is reachable.
if ! $PYTHON_CMD --version >/dev/null 2>&1; then
    echo "[ERROR] '$PYTHON_CMD' is not available."
    echo "        BrandStudio requires Python 3.12. Install from"
    echo "        https://www.python.org/downloads/release/python-3120/"
    echo "        or override with BRANDSTUDIO_PY=<your-python-tag>."
    exit 1
fi

echo "[OK] $($PYTHON_CMD --version) (via '$PYTHON_CMD')"
echo ""

# Existing venv: check version + that the inner python actually runs. The
# inner-python check catches a broken Windows redirect from a venv built on
# a different user account (symptom: 'No Python at "C:\...\python.exe"').
if [ -d "../venv" ]; then
    if [ -f "../venv/pyvenv.cfg" ] && ! grep -q "version = 3.12" ../venv/pyvenv.cfg; then
        echo "[WARN] Existing '../venv' was created with a different Python version:"
        grep "version" ../venv/pyvenv.cfg
        echo "       Delete it and re-run: rm -rf ../venv && ./start.sh"
        exit 1
    fi
    if [[ "$IS_WINDOWS" == "true" ]]; then
        VENV_PY="../venv/Scripts/python.exe"
    else
        VENV_PY="../venv/bin/python"
    fi
    if [ -f "$VENV_PY" ] && ! "$VENV_PY" --version >/dev/null 2>&1; then
        echo "[WARN] Existing venv's python is unusable on this machine."
        echo "       Likely a stale redirect from another user account."
        echo "       Delete it and re-run: rm -rf ../venv && ./start.sh"
        exit 1
    fi
else
    echo "[INFO] Creating virtual environment with $PYTHON_CMD..."
    $PYTHON_CMD -m venv ../venv
    echo "[OK] Virtual environment created in ../venv"
    echo ""
fi

# Activate virtual environment
echo "[INFO] Activating virtual environment..."
source $VENV_ACTIVATE
echo "[OK] Virtual environment activated"
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

