import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Gestione del caricamento dei file Excel
ipcMain.handle('load-excel', async (event, filePath: string) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Errore nel caricamento del file Excel:', error);
    return {
      success: false,
      error: 'Errore nel caricamento del file Excel'
    };
  }
});

// Gestione dell'analisi dei dati
ipcMain.handle('analyze-data', async (event, data: any) => {
  try {
    // Qui implementeremo la logica di analisi dei dati
    // Per ora restituiamo un risultato di esempio
    return {
      success: true,
      analysis: {
        summary: "Analisi completata con successo",
        metrics: {
          totale: data.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0),
          media: data.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) / data.length,
          count: data.length
        }
      }
    };
  } catch (error) {
    console.error('Errore nell\'analisi dei dati:', error);
    return {
      success: false,
      error: 'Errore nell\'analisi dei dati'
    };
  }
});

// Gestione delle domande all'AI
ipcMain.handle('ask-ai', async (event, question: string) => {
  try {
    // Qui implementeremo la logica per l'interazione con l'AI
    // Per ora restituiamo una risposta di esempio
    return {
      success: true,
      response: `Risposta alla domanda: ${question}`
    };
  } catch (error) {
    console.error('Errore nella richiesta all\'AI:', error);
    return {
      success: false,
      error: 'Errore nella richiesta all\'AI'
    };
  }
}); 