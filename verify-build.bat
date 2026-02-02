@echo off
echo ============================================
echo NotesMaker - Build Verification
echo ============================================
echo.

echo [1/4] Checking build artifacts...
if not exist "Frontend\dist\index.html" (
    echo ERROR: Frontend not built! Run: npm run build:frontend
    exit /b 1
)
echo    ✓ Frontend build exists

if not exist "build\icon.png" (
    echo ERROR: Icon missing!
    exit /b 1
)
echo    ✓ Icon exists

if not exist "Backend\start.mjs" (
    echo ERROR: Backend start script missing!
    exit /b 1
)
echo    ✓ Backend start script exists

echo.
echo [2/4] Checking package.json configuration...
findstr /C:"asarUnpack" package.json >nul
if errorlevel 1 (
    echo ERROR: asarUnpack not configured!
    exit /b 1
)
echo    ✓ asarUnpack configured

echo.
echo [3/4] Checking Backend dependencies...
if not exist "Backend\node_modules" (
    echo WARNING: Backend dependencies not installed
    echo Run: cd Backend ^&^& npm install
    exit /b 1
)
echo    ✓ Backend dependencies installed

echo.
echo [4/4] Checking Frontend dependencies...
if not exist "Frontend\node_modules" (
    echo WARNING: Frontend dependencies not installed
    echo Run: cd Frontend ^&^& npm install
    exit /b 1
)
echo    ✓ Frontend dependencies installed

echo.
echo ============================================
echo ✓ All checks passed!
echo ============================================
echo.
echo Ready to build AppImage (on Linux):
echo   npm run dist:linux
echo.
echo Or package for Windows:
echo   npm run dist
