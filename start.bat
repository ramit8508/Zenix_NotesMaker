@echo off
echo Starting Task Notepad...
echo.

REM Check if dependencies are installed
if not exist "Backend\node_modules" (
    echo Installing Backend dependencies...
    cd Backend
    call npm install
    cd ..
)

if not exist "Frontend\node_modules" (
    echo Installing Frontend dependencies...
    cd Frontend
    call npm install
    cd ..
)

echo.
echo Starting servers...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo.

REM Start backend and frontend
start "Backend Server" cmd /k "cd Backend && npm start"
start "Frontend Server" cmd /k "cd Frontend && npm run dev"
