# Building AppImage for NotesMaker

## Prerequisites for Linux AppImage Build

1. **Node.js and npm** must be installed on the system:
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```

2. **Verify Node.js version** (v16 or higher recommended):
   ```bash
   node --version
   npm --version
   ```

## Build Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install Frontend dependencies
cd Frontend
npm install
cd ..

# Install Backend dependencies
cd Backend
npm install
cd ..
```

### 2. Build Frontend

```bash
npm run build:frontend
```

### 3. Build AppImage

```bash
npm run dist:linux
```

The AppImage will be created in the `dist/` directory.

## Running the AppImage

### Make it executable:
```bash
chmod +x dist/NotesMaker-*.AppImage
```

### Run it:
```bash
./dist/NotesMaker-*.AppImage
```

## Troubleshooting

### Issue: "node: not found" error
**Solution**: Make sure Node.js is installed system-wide:
```bash
sudo apt install nodejs
```

### Issue: AppImage doesn't start
**Solution**: Check if you have FUSE installed (required for AppImage):
```bash
sudo apt install fuse libfuse2
```

### Issue: Backend doesn't connect
**Solution**: Make sure port 3000 is available:
```bash
sudo lsof -i :3000
```

### Issue: Blank screen on startup
**Solution**: Wait 3-5 seconds for the backend to initialize. If the issue persists, run from terminal to see error logs:
```bash
./dist/NotesMaker-*.AppImage
```

## AppImage Environment Detection

The app automatically detects when running as AppImage via the `APPIMAGE` environment variable and adjusts:
- Uses system Node.js instead of Electron's binary
- Correctly resolves Backend path in AppImage structure
- Handles icon and resource paths appropriately

## File Structure in AppImage

```
AppImage/
├── resources/
│   └── Backend/
│       ├── Index.js
│       ├── package.json
│       ├── node_modules/
│       └── ... (all backend files)
└── ... (Electron app files)
```
