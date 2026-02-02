# AppImage Fixes Applied

## Problems Resolved

### 1. **Node.js Execution Issue**
- **Problem**: AppImage was trying to use Electron binary as Node.js, which doesn't work in AppImage environment
- **Fix**: Detect AppImage environment and use system Node.js instead
- **File**: `Frontend/electron/main.cjs`

### 2. **Backend Dependencies Missing**
- **Problem**: Backend node_modules weren't being included in the build
- **Fix**: Added `afterPack.js` script to install production dependencies after build
- **Files**: `package.json`, `afterPack.js`

### 3. **Database Write Permissions**
- **Problem**: AppImage is read-only, can't write database to app directory
- **Fix**: Use user's home directory (`~/.notesmaker/`) for database in packaged app
- **File**: `Backend/Db/database.js`

### 4. **Resource Paths**
- **Problem**: Incorrect paths for icons and resources in packaged app
- **Fix**: Properly configured `asarUnpack` and resource paths
- **File**: `package.json`

### 5. **Backend Not Starting**
- **Problem**: ELECTRON_RUN_AS_NODE environment variable conflicting on Linux
- **Fix**: Only set this variable when actually using Electron binary as Node
- **File**: `Frontend/electron/main.cjs`

## Changes Made

### package.json
- Added `asarUnpack` for Backend directory
- Configured `afterPack` hook
- Added `executableName` for Linux
- Improved resource filtering
- Added icon to build files

### Frontend/electron/main.cjs
- Added AppImage detection
- Use system Node.js for AppImage
- Fixed environment variable handling
- Added debug logging

### Backend/Db/database.js
- Added user data directory support
- Creates `~/.notesmaker/` folder for database
- Automatically detects packaged vs development mode

### New Files
- `afterPack.js` - Installs Backend dependencies post-build
- `BUILD_APPIMAGE.md` - Documentation for building AppImage
- `build-appimage.sh` - Automated build script for Linux

## How to Build

### On Linux:
```bash
# Method 1: Use the build script
chmod +x build-appimage.sh
./build-appimage.sh

# Method 2: Manual build
npm install
cd Frontend && npm install && cd ..
cd Backend && npm install && cd ..
npm run build:frontend
npm run dist:linux
```

### Run the AppImage:
```bash
chmod +x dist/NotesMaker-*.AppImage
./dist/NotesMaker-*.AppImage
```

## Testing Checklist

- [ ] AppImage starts without errors
- [ ] Backend server starts successfully
- [ ] Frontend loads properly
- [ ] Can create new notes
- [ ] Can view existing notes
- [ ] Database persists in `~/.notesmaker/`
- [ ] No permission errors

## Requirements

### System Requirements:
- Node.js (v16+) installed system-wide
- npm
- FUSE (for AppImage: `sudo apt install fuse libfuse2`)

### Build Requirements:
- All npm dependencies installed
- Frontend built (`npm run build:frontend`)
- Backend dependencies installed

## Database Location

- **Development**: `Backend/Db/tasks.db`
- **AppImage**: `~/.notesmaker/tasks.db`

This ensures the AppImage can write data even though it's mounted as read-only.
