@echo off
REM BrandStudio Dashboard - Start Script for Windows
REM Flask application for managing dealership brands.
REM
REM Pinned to Python 3.12: Pillow==10.1.0 and cryptography==42.0.8 only
REM ship prebuilt wheels through Python 3.12. On 3.13/3.14 pip falls back to
REM compiling from source which fails with "Getting requirements to build wheel ... error"
REM unless MSVC + libjpeg + Rust + OpenSSL are all installed locally.
REM
REM Override the version with: set BRANDSTUDIO_PY=-3.12 (or another tag) before
REM running this script.

setlocal

echo.
echo ==========================================
echo   BrandStudio Dashboard (Python)
echo ==========================================
echo.

if "%BRANDSTUDIO_PY%"=="" set BRANDSTUDIO_PY=-3.12

REM Check the Windows Python launcher is present
py --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python launcher 'py' is not installed.
    echo         Install Python from https://www.python.org/downloads/ and try again.
    pause
    exit /b 1
)

REM Check the requested Python version is installed
py %BRANDSTUDIO_PY% --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python %BRANDSTUDIO_PY% is not installed on this machine.
    echo         Available versions:
    py -0
    echo.
    echo         BrandStudio is pinned to Python 3.12 because Pillow 10.1.0 and
    echo         cryptography 42.0.8 only ship wheels through 3.12. Install Python
    echo         3.12 from https://www.python.org/downloads/release/python-3120/
    echo         or set BRANDSTUDIO_PY to another version you have built wheels for.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('py %BRANDSTUDIO_PY% --version') do set PYTHON_VERSION=%%i
echo [OK] %PYTHON_VERSION% (via 'py %BRANDSTUDIO_PY%')
echo.

if not exist "app.py" (
    echo [ERROR] app.py not found. Please run this script from the brandstudio root.
    pause
    exit /b 1
)

REM Detect a broken or wrong-version venv. Two failure modes both bite:
REM
REM   1. pyvenv.cfg says the wrong Python version (e.g. 3.14 after a default
REM      upgrade). pip install will fail with no Pillow / cryptography wheels.
REM
REM   2. pyvenv.cfg looks fine BUT venv\Scripts\python.exe is a Windows redirect
REM      pointing to a Python install path that no longer exists on this
REM      machine (e.g. venv created on another Windows user account, then the
REM      user dir was renamed or the python install moved). Activating the
REM      venv "succeeds" but every subsequent command fails with
REM      'No Python at "C:\Users\...\python.exe"'.
REM
REM Both cases: refuse to use the existing venv and tell the operator to
REM `rmdir /s /q venv` + re-run.
if exist "venv\pyvenv.cfg" (
    findstr /C:"version = 3.12" venv\pyvenv.cfg >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Existing 'venv' was created with a different Python version.
        type venv\pyvenv.cfg | findstr /C:"version"
        echo.
        echo        Delete it and re-run this script:
        echo            rmdir /s /q venv
        echo            start.bat
        pause
        exit /b 1
    )

    REM Smoke-test the venv's python.exe — catches the broken-redirect case
    REM that the pyvenv.cfg version-check misses.
    venv\Scripts\python.exe --version >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Existing 'venv\Scripts\python.exe' is unusable on this machine.
        echo        The venv likely came from a different Windows user account,
        echo        so its python.exe is a redirect to a path that no longer
        echo        exists here. Symptom: 'No Python at "C:\...\python.exe"'.
        echo.
        echo        Delete it and re-run this script:
        echo            rmdir /s /q venv
        echo            start.bat
        pause
        exit /b 1
    )
)

if not exist "venv" (
    echo [INFO] Creating virtual environment with Python %BRANDSTUDIO_PY%...
    py %BRANDSTUDIO_PY% -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create venv.
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created.
    echo.
)

echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated.
echo.

if exist "requirements.txt" (
    echo [INFO] Installing/updating dependencies from requirements.txt...
    python -m pip install --upgrade pip >nul
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] pip install failed. See the error above.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed.
    echo.
)

echo [INFO] Starting BrandStudio Dashboard...
echo        Access at: http://localhost:5000
echo        Press Ctrl+C to stop the server.
echo.

python app.py

endlocal
pause
