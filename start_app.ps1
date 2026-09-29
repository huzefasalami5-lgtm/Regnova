# ==============================================================================
# REGNOVA Full-Stack Host Launcher (PowerShell)
# ==============================================================================
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Starting REGNOVA Full-Stack Meteorological AI Platform" -ForegroundColor Green
Write-Host "  SIH 2026 Problem SIH26080 | Team VYSTRAL" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start FastAPI Backend on Port 8000 in a new window
Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; Write-Host 'REGNOVA Backend API Running...' -ForegroundColor Green; & 'services\api\.venv\Scripts\python.exe' -m uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload"

# 2. Start Vite Frontend Web App on Port 3000 in a new window
Write-Host "[2/2] Launching React Frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\apps\web'; Write-Host 'REGNOVA Web App Running...' -ForegroundColor Cyan; npm.cmd run dev"

Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  Both servers launched successfully!" -ForegroundColor Green
Write-Host "  - Frontend Web UI : http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - API Portal      : http://localhost:8000" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Green
