import { contextBridge, ipcRenderer } from 'electron';

// Esponiamo le API in modo sicuro al frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // API per il caricamento dei file Excel
  loadExcel: async (filePath: string) => {
    return await ipcRenderer.invoke('load-excel', filePath);
  },

  // API per l'analisi dei dati
  analyzeData: async (data: any) => {
    return await ipcRenderer.invoke('analyze-data', data);
  },

  // API per le domande all'AI
  askAI: async (question: string) => {
    return await ipcRenderer.invoke('ask-ai', question);
  }
}); 