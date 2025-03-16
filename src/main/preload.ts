import { contextBridge, ipcRenderer } from 'electron';

declare global {
  interface Window {
    electronAPI: {
      loadExcel: (buffer: ArrayBuffer) => Promise<any>;
      analyzeData: (data: any) => Promise<any>;
      askAI: (question: string) => Promise<any>;
    }
  }
}

// Esponiamo le API in modo sicuro al frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // API per il caricamento dei file Excel
  loadExcel: async (buffer: ArrayBuffer) => {
    return await ipcRenderer.invoke('load-excel', buffer);
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