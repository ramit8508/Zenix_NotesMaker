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
  
  console.log('Starting backend from:', backendPath);
  console.log('Using node:', nodePath);
  
  backendProcess = spawn(nodePath, ['Index.js'], {
    cwd: backendPath,
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
  
  backendProcess.on('exit', (code, signal) => {
    console.log('Backend process exited with code:', code, 'signal:', signal);
  });
}

function createWindow() {
  const isDev = !app.isPackaged;
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: isDev 
      ? path.join(__dirname, '..', '..', 'build', 'icon.png')
      : path.join(process.resourcesPath, '..', 'build', 'icon.png')
  });

  // Show window when ready to avoid white screen
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In packaged app, load from app.asar
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('Loading index from:', indexPath);
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
    });
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  
  // Wait for backend to start (reduce delay for better UX)
  setTimeout(() => {
    createWindow();
  }, 3000);

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
