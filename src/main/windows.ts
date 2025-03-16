import { BrowserWindow, app } from 'electron';
import path from 'path';

export function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // In development, load from localhost:3000
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built Next.js app
    mainWindow.loadFile(path.join(__dirname, '../renderer/out/index.html'));
  }

  mainWindow.on('closed', () => {
    app.quit();
  });

  return mainWindow;
}

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    const windows = BrowserWindow.getAllWindows();
    if (windows.length) {
      if (windows[0].isMinimized()) windows[0].restore();
      windows[0].focus();
    }
  });
} 