#!/bin/bash

# Script to check the NotesMaker database contents
# Run this from terminal/command line

DB_PATH="$HOME/.notesmaker/tasks.db"

echo "========================================"
echo "NotesMaker Database Check"
echo "========================================"
echo ""

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database file not found at: $DB_PATH"
    echo ""
    echo "Possible locations to check:"
    echo "  ~/.notesmaker/tasks.db"
    echo "  %USERPROFILE%\\.notesmaker\\tasks.db (Windows)"
    exit 1
fi

echo "✅ Database found at: $DB_PATH"
echo "📊 File size: $(du -h "$DB_PATH" | cut -f1)"
echo ""

echo "========================================"
echo "DEVICES"
echo "========================================"
sqlite3 "$DB_PATH" "SELECT * FROM devices;"
echo ""

echo "========================================"
echo "NOTES COUNT"
echo "========================================"
sqlite3 "$DB_PATH" "SELECT COUNT(*) as total_notes FROM notes;"
echo ""

echo "========================================"
echo "NOTES BY FOLDER"
echo "========================================"
sqlite3 "$DB_PATH" "SELECT folder, COUNT(*) as count FROM notes GROUP BY folder ORDER BY folder;"
echo ""

echo "========================================"
echo "ALL NOTES"
echo "========================================"
sqlite3 "$DB_PATH" ".mode column" ".headers on" "SELECT id, device_id, title, folder, created_at FROM notes ORDER BY created_at DESC;"
echo ""

echo "========================================"
echo "CUSTOM FOLDERS"
echo "========================================"
sqlite3 "$DB_PATH" "SELECT * FROM folders;"
echo ""
