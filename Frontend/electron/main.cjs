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
    // For AppImage, use node from PATH instead of electron binary
    if (process.platform === 'linux' && process.env.APPIMAGE) {
      nodePath = 'node';
    } else {
      // Use the Node.js binary bundled with Electron
      nodePath = process.execPath;
    }
  }
  
  console.log('Starting backend from:', backendPath);
  console.log('Using node:', nodePath);
  console.log('Is AppImage:', !!process.env.APPIMAGE);
  console.log('Platform:', process.platform);
  
  const spawnOptions = {
    cwd: backendPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { 
      ...process.env, 
      IS_PACKAGED: (!isDev).toString(),
      PORT: '5000'
    }
  };
  
  // Only set ELECTRON_RUN_AS_NODE if using electron binary as node
  if (nodePath === process.execPath && process.platform !== 'linux') {
    spawnOptions.env.ELECTRON_RUN_AS_NODE = '1';
  }
  
  backendProcess = spawn(nodePath, ['start.mjs'], spawnOptions);
  
  // Capture backend output
  if (backendProcess.stdout) {
    backendProcess.stdout.on('data', (data) => {
      console.log('[Backend]:', data.toString());
    });
  }
  
  if (backendProcess.stderr) {
    backendProcess.stderr.on('data', (data) => {
      console.error('[Backend Error]:', data.toString());
    });
  }

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
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
      sandbox: false // Allow file access for images
    },
    icon: path.join(__dirname, '..', '..', 'build', 'icon.png')
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
  
  // Wait for backend to start
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
