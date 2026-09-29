@echo off
title REGNOVA Full-Stack Host Launcher
color 0b
echo =================================================================
echo   Starting REGNOVA Full-Stack Meteorological AI Platform
echo   SIH 2026 Problem SIH26080 - Team VYSTRAL
echo =================================================================

start "REGNOVA Backend API (Port 8000)" powershell -NoExit -Command "cd '%~dp0'; Write-Host 'FastAPI Backend running on http://localhost:8000' -ForegroundColor Green; & 'services\api\.venv\Scripts\python.exe' -m uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload"

start "REGNOVA Frontend UI (Port 3000)" powershell -NoExit -Command "cd '%~dp0apps\web'; Write-Host 'Vite Frontend running on http://localhost:3000' -ForegroundColor Cyan; npm.cmd run dev"

echo.
echo Both servers launched in background windows!
echo - Frontend Web UI : http://localhost:3000
echo - Backend API Docs: http://localhost:8000/docs
echo - Backend Portal  : http://localhost:8000
echo =================================================================
pause
