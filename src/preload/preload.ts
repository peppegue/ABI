// Definisci global come window
(window as any).global = window;

import { contextBridge, ipcRenderer } from 'electron';

// Esponi le API sicure al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  loadExcel: async (filePath: string) => {
    try {
      return await ipcRenderer.invoke('load-excel', filePath);
    } catch (error) {
      console.error('Errore nel caricamento Excel:', error);
      return { success: false, error: 'Errore nel caricamento del file Excel' };
    }
  },
  analyzeData: async (data: any) => {
    try {
      return await ipcRenderer.invoke('analyze-data', data);
    } catch (error) {
      console.error('Errore nell\'analisi dei dati:', error);
      return { success: false, error: 'Errore nell\'analisi dei dati' };
    }
  },
  askAI: async (question: string) => {
    try {
      return await ipcRenderer.invoke('ask-ai', question);
    } catch (error) {
      console.error('Errore nella richiesta all\'AI:', error);
      return { success: false, error: 'Errore nella richiesta all\'AI' };
    }
  }
}); 