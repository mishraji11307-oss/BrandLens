Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting BrandLens - AI Brand Governance Platform" -ForegroundColor Cyan
Write-Host "Inkloom AI | CodeNexus India 2026 | Team V4Vantage" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\brandlens\backend"

Write-Host "`n[1/2] Running Backend Verification Tests..." -ForegroundColor Yellow
python run_tests.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "Verification tests failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n[2/2] Starting BrandLens Server on http://localhost:8000 ..." -ForegroundColor Green
Write-Host "Serving React SPA + FastAPI REST API simultaneously." -ForegroundColor Green
Write-Host "Open your browser to: http://localhost:8000" -ForegroundColor White
python run.py

