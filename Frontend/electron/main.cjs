const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Start Backend Server
function startBackend() {
  const isDev = !app.isPackaged;
  
  let backendPath;
  let nodePath;
  
  if (isDev) {
    // Development: Backend is in project root
    backendPath = path.join(__dirname, '..', '..', 'Backend');
    nodePath = process.platform === 'win32' ? 'node.exe' : 'node';
  } else {
    // Production: Backend is in resources/Backend
    backendPath = path.join(process.resourcesPath, 'Backend');
    // Use the Node.js binary bundled with Electron
    nodePath = process.execPath;
  }
  
  backendProcess = spawn(nodePath, ['Index.js'], {
    cwd: backendPath,
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '..', '..', 'build', 'icon.png')
  });

  // Load the app - check if dev server is running
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  
  // Wait longer for both backend and vite dev server to start
  setTimeout(() => {
    createWindow();
  }, 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
