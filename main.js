// main.js
const { app, BrowserWindow } = require("electron");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log("Caricamento URL in Electron:", "http://localhost:3000");
  mainWindow.loadURL("http://localhost:3000");

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Errore nel caricamento:", errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
