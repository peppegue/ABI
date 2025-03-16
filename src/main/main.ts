import { app, BrowserWindow, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import isDev from 'electron-is-dev';

// Variabile globale per la finestra principale
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Crea la finestra del browser
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, isDev ? '../preload/preload.js' : 'preload.js')
    },
    show: false // Non mostrare finché non è pronto
  });

  // Gestione del caricamento dell'applicazione
  if (isDev) {
    // In sviluppo, carica da localhost
    console.log('Loading development server...');
    mainWindow.loadURL('http://localhost:3001')
      .then(() => {
        console.log('Development server loaded successfully');
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.openDevTools();
        }
      })
      .catch((err) => {
        console.error('Failed to load development server:', err);
      });
  } else {
    // In produzione, carica il file HTML buildato
    const indexPath = path.join(__dirname, '../renderer/index.html');
    console.log('Production index path:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
        .then(() => {
          console.log('Production file loaded successfully');
          if (mainWindow) {
            mainWindow.show();
          }
        })
        .catch((err) => {
          console.error('Failed to load production file:', err);
        });
    } else {
      console.error('Production file not found:', indexPath);
    }
  }

  // Eventi della finestra
  mainWindow.on('ready-to-show', () => {
    console.log('Window ready to show');
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    if (isDev) {
      // Riprova a caricare in sviluppo dopo un ritardo
      setTimeout(() => {
        if (mainWindow) {
          console.log('Retrying development server...');
          mainWindow.loadURL('http://localhost:3001');
        }
      }, 5000);
    }
  });

  // Gestione errori
  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  mainWindow.webContents.once('render-process-gone', () => {
    console.log('Renderer process crashed');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inizializzazione dell'app
app.whenReady().then(() => {
  // Registra il protocollo file
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(err => {
  console.error('Failed to initialize app:', err);
});

// Gestione della chiusura dell'app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gestione degli errori non catturati
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Gestione degli errori di promesse non catturate
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
}); 