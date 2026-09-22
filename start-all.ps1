# PowerShell Launcher for Real-Time National Land Acquisition & Management System
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " Starting Real-Time National Land Acquisition & Management System" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/3] Starting Python FastAPI AI Microservice (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\ai-service'; python main.py"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Node.js Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; npm start"

Start-Sleep -Seconds 3

Write-Host "[3/3] Starting React Vite Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host "`n=========================================================================" -ForegroundColor Cyan
Write-Host " All 3 microservices initiated!" -ForegroundColor Green
Write-Host " - Frontend Application:  http://localhost:5173" -ForegroundColor White
Write-Host " - Backend API:           http://localhost:5000/api/health" -ForegroundColor White
Write-Host " - AI Microservice:       http://localhost:8000/health" -ForegroundColor White
Write-Host "=========================================================================`n" -ForegroundColor Cyan
