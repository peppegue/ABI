'use client';

import { useState, useCallback } from 'react';
import { Button } from '@mui/material';
import ExcelUploader from '../components/ExcelUploader';
import AIDialog from '../components/AIDialog';

interface DataItem {
  [key: string]: any;
}

export default function AnalyzePage() {
  const [data, setData] = useState<DataItem[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // Creiamo un oggetto FileReader per leggere il file
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          const buffer = e.target.result;
          const result = await window.electronAPI.loadExcel(buffer);
          if (result.success) {
            setData(result.data);
          } else {
            console.error('Errore nel caricamento del file:', result.error);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
    }
  }, []);

  const handleAIQuestion = async (question: string): Promise<string> => {
    try {
      const result = await window.electronAPI.askAI(question);
      if (result.success) {
        return result.response;
      }
      throw new Error(result.error);
    } catch (error) {
      console.error('Errore nella richiesta AI:', error);
      throw error;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Analisi dei Dati</h1>
      
      <div className="mb-8">
        <ExcelUploader onFileUpload={handleFileUpload} />
      </div>

      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dati Caricati</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(data[0], null, 2)}
            </pre>
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
            className="mt-4"
          >
            Analizza con AI
          </Button>
        </div>
      )}

      <AIDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAsk={handleAIQuestion}
      />
    </main>
  );
} 