import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Gestione del caricamento dei file Excel
ipcMain.handle('load-excel', async (event, buffer: ArrayBuffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
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
    // Analisi dei dati
    const metrics = [
      {
        id: 'total',
        label: 'Totale Vendite',
        value: data.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0).toFixed(2),
        iconName: 'dollar-sign',
        iconColor: 'text-green-500',
        trend: '+12%'
      },
      {
        id: 'average',
        label: 'Media Vendite',
        value: (data.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) / data.length).toFixed(2),
        iconName: 'trending-up',
        iconColor: 'text-blue-500',
        trend: '+5%'
      },
      {
        id: 'transactions',
        label: 'Transazioni',
        value: data.length.toString(),
        iconName: 'bar-chart',
        iconColor: 'text-purple-500',
        trend: '+8%'
      },
      {
        id: 'customers',
        label: 'Clienti Unici',
        value: new Set(data.map((item: any) => item.customer)).size.toString(),
        iconName: 'users',
        iconColor: 'text-orange-500',
        trend: '+15%'
      }
    ];

    // Dati per i grafici
    const chartData = {
      monthly: {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
        datasets: [{
          label: 'Vendite Mensili',
          data: [30, 40, 45, 50, 49, 60],
          borderColor: '#1a73e8'
        }]
      },
      distribution: {
        labels: ['Prodotto A', 'Prodotto B', 'Prodotto C', 'Prodotto D'],
        datasets: [{
          data: [30, 25, 25, 20],
          backgroundColor: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335']
        }]
      }
    };

    return {
      success: true,
      analysis: {
        welcomeMessage: `Ho analizzato i tuoi dati. Ci sono ${data.length} transazioni per un totale di ${metrics[0].value}€. La media delle vendite è di ${metrics[1].value}€ per transazione.`,
        metrics: metrics,
        chartData: chartData
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
    // Simulazione di una risposta intelligente basata sulla domanda
    let response = '';
    if (question.toLowerCase().includes('vendite')) {
      response = 'Le vendite mostrano un trend positivo con una crescita del 12% rispetto al periodo precedente.';
    } else if (question.toLowerCase().includes('clienti')) {
      response = 'Abbiamo un totale di clienti unici in crescita, con un aumento del 15% nelle nuove acquisizioni.';
    } else if (question.toLowerCase().includes('prodotti')) {
      response = 'Il Prodotto A è il più venduto, rappresentando il 30% delle vendite totali.';
    } else {
      response = 'Posso aiutarti con analisi delle vendite, informazioni sui clienti e performance dei prodotti. Cosa ti interessa sapere?';
    }

    return {
      success: true,
      response: response
    };
  } catch (error) {
    console.error('Errore nella richiesta all\'AI:', error);
    return {
      success: false,
      error: 'Errore nella richiesta all\'AI'
    };
  }
}); 