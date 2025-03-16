"use client";

import { useState } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

const UploaderContainer = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 1rem;
  min-height: 120px;
  max-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 1rem auto;
`;

const DropZone = styled.div`
  border: 2px dashed #1a73e8;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
  max-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(26, 115, 232, 0.05);
  }

  p {
    color: #666;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const StatusMessage = styled.div`
  margin-top: 1rem;
  
  &.error {
    color: #f44336;
  }
  
  &.success {
    color: #4CAF50;
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .icon {
      color: #1a73e8;
    }

    .details {
      text-align: left;

      .name {
        font-weight: 500;
        color: #333;
      }

      .size {
        font-size: 0.875rem;
        color: #666;
      }
    }
  }

  .remove {
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
`;

const PromptInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #2d3748;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

export default function ExcelUploader({ onDataProcessed }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [rawData, setRawData] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processExcelFile = async (file) => {
    try {
      setProcessing(true);
      setError(null);

      if (!file) {
        throw new Error('Nessun file selezionato');
      }

      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(fileExtension)) {
        throw new Error('Il file deve essere in formato Excel (.xlsx o .xls)');
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          
          console.log('Lettura file completata:', {
            nome: file.name,
            dimensione: data.length,
            tipo: file.type
          });

          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            cellNF: true,
            cellText: true,
            dateNF: 'yyyy-mm-dd'
          });
          
          if (!workbook.SheetNames.length) {
            throw new Error('Il file Excel non contiene fogli di lavoro');
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: null
          });

          // Pulizia e validazione più rigorosa dei dati
          const cleanData = rawData
            .filter(row => row && Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
            .map(row => 
              Array.isArray(row) ? 
                row.map(cell => {
                  if (cell instanceof Date) {
                    return cell.toISOString().split('T')[0];
                  }
                  return cell?.toString() || '';
                }) :
                []
            );

          if (!cleanData.length || cleanData.length < 2) {
            throw new Error('Il file non contiene dati sufficienti');
          }

          console.log('Struttura dati Excel:', {
            foglio: sheetName,
            totaleRighe: cleanData.length,
            colonne: cleanData[0].length,
            intestazioni: cleanData[0],
            primaRiga: cleanData[1]
          });

          // Salva i dati nello stato
          setCurrentFile(file);
          setRawData(cleanData);

          // Esegui l'analisi automaticamente
          await analyzeData(cleanData, file.name, sheetName);

        } catch (error) {
          console.error('Errore dettagliato nel caricamento:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          setError(`Errore durante il caricamento: ${error.message}`);
          handleRemoveFile();
        } finally {
          setProcessing(false);
        }
      };

      reader.onerror = (error) => {
        console.error('Errore nella lettura del file:', error);
        setError('Errore nella lettura del file');
        setProcessing(false);
        handleRemoveFile();
      };

      reader.readAsArrayBuffer(file);

    } catch (error) {
      console.error('Errore nel processamento del file:', error);
      setError(error.message || 'Errore nel processamento del file');
      setProcessing(false);
      handleRemoveFile();
    }
  };

  const analyzeData = async (data, fileName, sheetName, prompt = '') => {
    try {
      setProcessing(true);
      setError(null);

      // Validazione più stringente dei dati
      if (!data || !Array.isArray(data)) {
        console.error('Dati non validi:', { data });
        throw new Error('Dati non validi: formato non corretto');
      }

      if (data.length < 2) {
        console.error('Dati insufficienti:', { lunghezza: data.length });
        throw new Error('Dati non validi: il file deve contenere almeno intestazioni e una riga di dati');
      }

      // Verifica che tutte le righe siano array
      if (data.some(row => !Array.isArray(row))) {
        console.error('Formato dati non valido:', { 
          primaRigaNonArray: data.findIndex(row => !Array.isArray(row))
        });
        throw new Error('Formato dati non valido: tutte le righe devono essere array');
      }

      // Prepara il corpo della richiesta
      const requestBody = {
        data: data.map(row => Array.isArray(row) ? row.map(cell => cell?.toString() || '') : []),
        fileName: fileName || 'file.xlsx',
        sheetName: sheetName || 'Sheet1',
        prompt: prompt || ''
      };

      // Debug del payload
      console.log('Invio dati all\'API:', {
        righe: requestBody.data.length,
        colonne: requestBody.data[0].length,
        esempio: requestBody.data.slice(0, 2),
        nomeFile: requestBody.fileName,
        foglio: requestBody.sheetName,
        hasPrompt: !!requestBody.prompt
      });

      const response = await fetch('/api/analyze-financial-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Errore risposta API:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || errorData.details || `Errore HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (!responseData || typeof responseData !== 'object') {
        console.error('Risposta non valida:', responseData);
        throw new Error('Risposta non valida dal server');
      }

      console.log('Analisi completata con successo:', {
        success: responseData.success,
        hasAnalysis: !!responseData.analysis,
        hasVisualizations: !!responseData.visualizations,
        chartsCount: responseData.visualizations?.length || 0
      });

      onDataProcessed(responseData);

    } catch (error) {
      console.error('Errore dettagliato nell\'analisi:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(`Errore durante l'analisi: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    
    // Verifica che ci siano dati validi
    if (!rawData || !Array.isArray(rawData) || rawData.length < 2) {
      setError('Carica prima un file Excel valido');
      return;
    }

    if (!currentFile) {
      setError('Nessun file selezionato');
      return;
    }

    // Usa i dati più recenti disponibili
    await analyzeData(rawData, currentFile.name, 'Sheet1', customPrompt);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.includes('excel') || file?.type.includes('spreadsheet')) {
      processExcelFile(file);
    } else {
      setError('Per favore carica un file Excel (.xlsx o .xls)');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    setRawData(null);
    setError(null);
    setCustomPrompt('');
  };

  return (
    <div>
      <UploaderContainer>
        <h2 className="text-xl font-semibold mb-4">Analisi Bilancio</h2>
        
        <DropZone
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput').click()}
        >
          {!currentFile ? (
            <>
              <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
              <p>Trascina qui il tuo file Excel o clicca per selezionarlo</p>
              <p className="text-sm text-gray-500">Supporta file .xlsx e .xls</p>
            </>
          ) : (
            <FilePreview>
              <div className="file-info">
                <DocumentIcon className="w-6 h-6 icon" />
                <div className="details">
                  <div className="name">{currentFile.name}</div>
                  <div className="size">{formatFileSize(currentFile.size)}</div>
                </div>
              </div>
              <XMarkIcon
                className="w-6 h-6 remove"
                onClick={handleRemoveFile}
              />
            </FilePreview>
          )}
        </DropZone>

        <form onSubmit={handlePromptSubmit} className="mt-4">
          <PromptInput
            placeholder="Inserisci qui la tua domanda per l'analisi (es: 'Analizza i trend dei ricavi e suggerisci strategie di miglioramento')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={processing || !currentFile}
          />
          <button
            type="submit"
            disabled={processing || !currentFile || !customPrompt.trim()}
            className={`mt-4 px-4 py-2 rounded-md text-white ${
              processing || !currentFile || !customPrompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {processing ? 'Analisi in corso...' : 'Analizza'}
          </button>
        </form>

        <FileInput
          type="file"
          id="fileInput"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          disabled={processing}
        />

        {error && (
          <StatusMessage className="error">
            {error}
          </StatusMessage>
        )}
      </UploaderContainer>
    </div>
  );
} 