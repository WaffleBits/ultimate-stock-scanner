@echo off
echo Starting Ultimate Stock Scanner...

REM Change to project directory
cd /d "%~dp0"

REM Start the development server
start cmd /k "npm run dev"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak > nul

REM Open the browser
echo Opening browser...
start http://localhost:5173

echo Application started successfully!
echo Press any key to exit...
pause > nul 