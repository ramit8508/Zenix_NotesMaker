@echo off
REM Script to check the NotesMaker database contents on Windows

SET DB_PATH=%USERPROFILE%\.notesmaker\tasks.db

echo ========================================
echo NotesMaker Database Check
echo ========================================
echo.

if not exist "%DB_PATH%" (
    echo Database file not found at: %DB_PATH%
    echo.
    echo Make sure you've run the app at least once!
    pause
    exit /b 1
)

echo Database found at: %DB_PATH%
echo File size: 
dir "%DB_PATH%" | find "tasks.db"
echo.

echo ========================================
echo DEVICES
echo ========================================
sqlite3 "%DB_PATH%" "SELECT * FROM devices;"
echo.

echo ========================================
echo NOTES COUNT
echo ========================================
sqlite3 "%DB_PATH%" "SELECT COUNT(*) as total_notes FROM notes;"
echo.

echo ========================================
echo NOTES BY FOLDER
echo ========================================
sqlite3 "%DB_PATH%" "SELECT folder, COUNT(*) as count FROM notes GROUP BY folder ORDER BY folder;"
echo.

echo ========================================
echo ALL NOTES
echo ========================================
sqlite3 "%DB_PATH%" "SELECT id, LEFT(device_id, 8) as device, title, folder, created_at FROM notes ORDER BY created_at DESC;"
echo.

echo ========================================
echo CUSTOM FOLDERS
echo ========================================
sqlite3 "%DB_PATH%" "SELECT * FROM folders;"
echo.

pause
