@echo off
echo ========================================================
echo   MediTrace AI Healthcare Cybersecurity Platform
echo ========================================================
echo Starting FastAPI backend on http://127.0.0.1:8000 ...
start "MediTrace FastAPI Backend" cmd /k "cd /d %~dp0 && python backend/main.py"

timeout /t 3 /nobreak >nul

echo Starting Vite frontend on http://127.0.0.1:5173 ...
start "MediTrace Vite Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================================
echo   Both services started!
echo   Dashboard:  http://127.0.0.1:5173
echo   API Docs:   http://127.0.0.1:8000/docs
echo ========================================================

