@echo off
echo =========================================================================
echo  Starting Real-Time National Land Acquisition & Management System
echo  Framework: RFCTLARR Act 2013 Statutory Digital Portal
echo =========================================================================

cd /d "%~dp0"

echo [1/3] Starting Python FastAPI AI Microservice (Port 8000)...
start "AI Microservice (FastAPI)" cmd /k "cd ai-service && python main.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend API (Port 5000)...
start "Backend API (Node.js)" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [3/3] Starting React Vite Frontend (Port 5173)...
start "Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo  All services launched!
echo  - Frontend Portal:  http://localhost:5173
echo  - Backend API:      http://localhost:5000/api/health
echo  - AI Microservice:  http://localhost:8000/health
echo =========================================================================
pause
