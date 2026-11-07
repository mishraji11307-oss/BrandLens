@echo off
echo ===================================================
echo Starting BrandLens - AI Brand Governance Platform
echo Inkloom AI ^| CodeNexus India 2026 ^| Team V4Vantage
echo ===================================================

cd brandlens\backend
echo [1/2] Running Backend Verification Tests...
python run_tests.py
if %ERRORLEVEL% NEQ 0 (
    echo Error during verification tests.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Starting BrandLens Server on http://localhost:8000 ...
echo Open your browser to http://localhost:8000 to launch the application.
python run.py
pause

