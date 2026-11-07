@echo off
title BrandLens Development Mode
echo ========================================================
echo   BrandLens - Full Stack Development Mode
echo ========================================================
echo.
echo [1/2] Launching Backend on http://localhost:8000 ...
start "BrandLens Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Launching Vite Frontend on http://localhost:5173 ...
start "BrandLens Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.
echo Both servers are running!
echo - Frontend with Hot-Reload: http://localhost:5173
echo - Backend API & Docs:       http://localhost:8000/docs
pause

