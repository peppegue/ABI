import { app } from 'electron';
import { createMainWindow } from './windows';
import './ipcHandlers';

// Gestione degli errori non catturati
process.on('uncaughtException', (error) => {
  console.error('Errore non catturato:', error);
});

// Quando l'app è pronta
app.whenReady().then(() => {
  createMainWindow();

  // Su macOS, ricrea la finestra quando l'icona del dock viene cliccata
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Gestione della chiusura dell'app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Configurazione per lo sviluppo
if (process.env.NODE_ENV === 'development') {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
} 