import { BrowserWindow, app, session } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import fs from 'fs';

export function createMainWindow(): BrowserWindow {
  // Configura CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';" +
          "style-src 'self' 'unsafe-inline';" +
          "img-src 'self' data: https:;" +
          "font-src 'self' data:;" +
          "connect-src 'self' http://localhost:* ws://localhost:*;" +
          "worker-src 'self';"
        ]
      }
    });
  });

  // Crea la finestra principale
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Non mostrare la finestra finché non è pronta
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, isDev ? '../preload/preload.js' : 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Gestione del caricamento
  if (isDev) {
    console.log('Running in development mode');
    const devServerUrl = 'http://localhost:3001';
    
    // Tenta di caricare l'URL di sviluppo
    mainWindow.loadURL(devServerUrl)
      .then(() => {
        console.log('Development server loaded successfully');
        mainWindow.show();
        mainWindow.webContents.openDevTools();
      })
      .catch((err) => {
        console.error('Failed to load development server:', err);
      });
  } else {
    console.log('Running in production mode');
    const prodPath = path.join(__dirname, '../renderer/index.html');
    
    // Verifica se il file di produzione esiste
    if (!fs.existsSync(prodPath)) {
      console.error('Production file not found:', prodPath);
      throw new Error('Production file not found');
    }

    // Carica il file di produzione
    mainWindow.loadFile(prodPath)
      .then(() => {
        console.log('Production file loaded successfully');
        mainWindow.show();
      })
      .catch((err) => {
        console.error('Failed to load production file:', err);
      });
  }

  // Eventi della finestra
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  mainWindow.webContents.once('render-process-gone', (event, details) => {
    console.log('Renderer process gone:', details);
  });

  // Pulisci la finestra quando viene chiusa
  mainWindow.on('closed', () => {
    session.defaultSession.webRequest.onHeadersReceived(null);
  });

  return mainWindow;
}

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length) {
      if (windows[0].isMinimized()) windows[0].restore();
      windows[0].focus();
    }
  });
} 