@echo off
title BrandLens Platform Launcher
echo ========================================================
echo   BrandLens - AI Brand Governance Platform
echo   Inkloom AI ^| CodeNexus India 2026 ^| Team V4Vantage
echo ========================================================
echo.
echo Starting BrandLens Full-Stack Server on http://localhost:8000 ...
echo (Serving FastAPI Backend + Watermelon UI Frontend + Pre-Seeded GlowCare Demo)
echo.
cd /d "%~dp0backend"
start http://localhost:8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause

