# AppImage Testing Guide

## Before Building

1. **Check Node.js is installed** (required for AppImage):
```bash
node --version  # Should show v16 or higher
```

2. **Clean previous builds**:
```bash
rm -rf dist/
rm -rf Frontend/dist/
```

## Build the AppImage

```bash
# Install all dependencies
npm install
cd Frontend && npm install && cd ..
cd Backend && npm install && cd ..

# Build frontend
npm run build:frontend

# Build AppImage
npm run dist:linux
```

## Testing Checklist

### 1. Make Executable
```bash
chmod +x dist/NotesMaker-*.AppImage
```

### 2. Run and Check Console Output
```bash
./dist/NotesMaker-*.AppImage
```

**Expected Output:**
```
Starting backend from: /tmp/.mount_NotesM<HASH>/resources/Backend
Using node: node
Is AppImage: true
Platform: linux
[Backend]: 🚀 Notes Maker Server running on http://localhost:5000
[Backend]: 📊 Health check: http://localhost:5000/health
📁 Using user data directory for database: /home/<user>/.notesmaker/tasks.db
✅ Database tables created successfully
```

### 3. Test Features

- [ ] App window opens (wait 5 seconds)
- [ ] Logo visible in top-left corner
- [ ] Can click "+ New Note" button
- [ ] Can type in note title
- [ ] Can type in note content
- [ ] Can save note (Save button works)
- [ ] Can see saved notes in sidebar
- [ ] Can switch between notes
- [ ] Can delete notes
- [ ] Database persists at `~/.notesmaker/tasks.db`

### 4. Check Backend Connection

Open developer tools (if available) and check console:
```
[API] Calling: http://localhost:5000/api/notes
```

### 5. Verify Database Location

```bash
ls -la ~/.notesmaker/
# Should show: tasks.db
```

## Common Issues & Solutions

### Issue: "node: not found"
```bash
sudo apt install nodejs npm
```

### Issue: Backend not starting
Check if port 5000 is available:
```bash
sudo lsof -i :5000
# If something is using it, kill it:
kill -9 <PID>
```

### Issue: Blank screen
- Wait 5-10 seconds for backend to start
- Check console output for errors
- Verify Node.js version is v16+

### Issue: Features not working (can't create notes)
- Open browser console (F12)
- Look for API errors
- Check if backend is running on port 5000:
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

### Issue: Logo not showing
- Check if logo files exist in the AppImage
- Look for 404 errors in console
- Verify the app is loading from the correct path

## Debug Mode

To see all backend logs:
```bash
./dist/NotesMaker-*.AppImage 2>&1 | tee appimage.log
```

This will save all output to `appimage.log` for debugging.

## Clean Uninstall

```bash
# Remove the AppImage
rm dist/NotesMaker-*.AppImage

# Remove user data (notes database)
rm -rf ~/.notesmaker/
```
