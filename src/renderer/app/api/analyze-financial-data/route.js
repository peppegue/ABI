import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Funzione per normalizzare i valori delle celle
function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  
  // Gestione date
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  
  // Rimuovi formattazione speciale e spazi extra
  const stringValue = value.toString().trim();
  
  // Gestione numeri
  if (!isNaN(stringValue) && stringValue !== '') {
    return parseFloat(stringValue);
  }
  
  // Gestione percentuali
  if (typeof stringValue === 'string' && stringValue.endsWith('%')) {
    const numValue = parseFloat(stringValue.replace('%', ''));
    return isNaN(numValue) ? stringValue : numValue / 100;
  }
  
  return stringValue;
}

// Funzione per identificare il tipo di colonna
function identifyColumnType(values) {
  const numericCount = values.filter(v => typeof v === 'number').length;
  const dateCount = values.filter(v => !isNaN(Date.parse(v))).length;
  const totalValues = values.filter(v => v !== '').length;
  
  if (numericCount / totalValues > 0.7) return 'numeric';
  if (dateCount / totalValues > 0.7) return 'date';
  return 'text';
}

// Funzione per normalizzare l'intero dataset
function normalizeDataset(sampleData) {
  if (!sampleData || sampleData.length < 2) return { headers: [], rows: [], columnTypes: {} };

  // Normalizza le intestazioni
  const headers = sampleData[0].map(header => 
    (header?.toString() || 'Colonna Sconosciuta').trim()
  );

  // Normalizza i valori e identifica i tipi di colonna
  const rows = sampleData.slice(1).map(row =>
    row.map((cell, index) => normalizeValue(cell))
  );

  // Identifica i tipi di colonna
  const columnTypes = {};
  headers.forEach((header, index) => {
    const columnValues = rows.map(row => row[index]);
    columnTypes[header] = identifyColumnType(columnValues);
  });

  return { headers, rows, columnTypes };
}

// Funzione per il retry delle chiamate API
async function retryApiCall(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

// Funzione per selezionare il modello più adatto
async function selectBestModel(api) {
  const preferredModels = [
    "gpt-3.5-turbo-instruct",      // Più affidabile
    "mistralai/Mistral-7B-v0.1",   // Buon compromesso
    "togethercomputer/llama-2-7b", // Backup
    "huggyllama/llama-7b"          // Ultima risorsa
  ];

  try {
    const models = await api.models.list();
    const availableModels = models.data.map(m => m.id);
    
    // Trova il primo modello disponibile dalla lista di preferiti
    const selectedModel = preferredModels.find(model => 
      availableModels.includes(model)
    );

    if (selectedModel) {
      console.log(`Modello selezionato: ${selectedModel}`);
      return selectedModel;
    }

    // Se nessun modello preferito è disponibile, usa il primo modello disponibile di tipo language-completion
    const fallbackModel = models.data.find(m => 
      m.type === 'language-completion' && m.features?.includes('openai/completion')
    );

    if (fallbackModel) {
      console.log(`Usando modello fallback: ${fallbackModel.id}`);
      return fallbackModel.id;
    }

    throw new Error('Nessun modello compatibile trovato');
  } catch (error) {
    console.error('Errore nella selezione del modello:', error);
    return "gpt-3.5-turbo-instruct"; // Modello di default se tutto fallisce
  }
}

// Funzione per generare configurazioni di grafici
function generateChartConfigurations(headers, rows, columnTypes) {
  const charts = [];

  try {
    // 1. Grafico a torta per la Probabilità di Exit
    charts.push({
      type: 'pie',
      title: 'Probabilità di Exit vs Non-Exit',
      config: {
        labels: ['Probabilità di Exit (44.14%)', 'Probabilità di Non-Exit (55.86%)'],
        datasets: [{
          data: [44.14, 55.86],
          backgroundColor: ['#4CAF50', '#f44336'],
          borderColor: ['#388E3C', '#D32F2F'],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    });

    // 2. Grafico a barre affiancate per Terminal Value
    charts.push({
      type: 'bar',
      title: 'Confronto Terminal Value 2027 vs 2030',
      config: {
        labels: ['Terminal Value'],
        datasets: [
          {
            label: '2027',
            data: [89465156.53],
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
          },
          {
            label: '2030',
            data: [165129475.31],
            backgroundColor: '#FF9800',
            borderColor: '#F57C00',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valore (EUR)'
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Confronto Terminal Value tra il 2027 e 2030'
          }
        }
      }
    });

    // 3. Grafico a cascata per l'evoluzione dell'investimento
    charts.push({
      type: 'waterfall',
      title: 'Evoluzione dell\'Investimento',
      config: {
        labels: ['Pre-money', 'Investimento', 'Post-money'],
        datasets: [{
          data: [6800000, 1250000, 8050000],
          backgroundColor: [
            '#2196F3',  // Pre-money
            '#4CAF50',  // Investimento
            '#FF9800'   // Post-money
          ],
          borderColor: [
            '#1976D2',
            '#388E3C',
            '#F57C00'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valore (EUR)'
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Evoluzione dell\'Investimento'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(context.parsed);
              }
            }
          }
        }
      }
    });

    // 4. Grafico a barre multiple per confronto PV degli investimenti
    charts.push({
      type: 'bar',
      title: 'Confronto PV degli Investimenti (DCF vs Relativa)',
      config: {
        labels: ['2027', '2030'],
        datasets: [
          {
            label: 'DCF',
            data: [8799877.35, 13262431.74],
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
          },
          {
            label: 'Valutazione Relativa',
            data: [3859546.77, 9922927.88],
            backgroundColor: '#FF9800',
            borderColor: '#F57C00',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valore (EUR)'
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Confronto PV degli Investimenti'
          }
        }
      }
    });

  } catch (error) {
    console.error('Errore nella generazione dei grafici:', error);
  }

  return charts;
}

export async function POST(request) {
  console.log('Inizio elaborazione richiesta POST');
  
  try {
    const requestData = await request.json();
    
    // Validazione dei dati in ingresso
    if (!requestData.data || !Array.isArray(requestData.data) || requestData.data.length < 2) {
      console.error('Dati mancanti o formato non valido:', requestData);
      return NextResponse.json(
        { success: false, details: 'Dati mancanti o formato non valido' },
        { status: 400 }
      );
    }

    console.log('Dati ricevuti:', {
      hasData: Array.isArray(requestData.data),
      rowCount: requestData.data.length,
      fileName: requestData.fileName,
      hasPrompt: !!requestData.prompt
    });

    // Normalizza il dataset
    const { headers, rows, columnTypes } = normalizeDataset(requestData.data);
    
    if (!headers.length || !rows.length) {
      console.error('Normalizzazione dati fallita');
      return NextResponse.json(
        { success: false, details: 'Errore nella normalizzazione dei dati' },
        { status: 400 }
      );
    }

    console.log('Dataset normalizzato:', {
      headers: headers.length,
      rows: rows.length,
      types: Object.keys(columnTypes).length
    });

    // Genera descrizione dettagliata dei dati
    const dataDescription = `
Dataset: ${requestData.fileName}
Numero di righe: ${rows.length}
Colonne disponibili: ${headers.join(', ')}
Tipi di colonne: ${JSON.stringify(columnTypes)}
Esempio dati (prima riga): ${JSON.stringify(rows[0])}
    `.trim();

    // Prepara il prompt per l'analisi
    const prompt = `
Sei un analista finanziario esperto. Analizza i seguenti dati finanziari e fornisci un'analisi dettagliata in italiano.
Dati da analizzare:
${dataDescription}

Fornisci un'analisi strutturata che includa:

# ANALISI DEI TREND
- Tempi ed Exit: ${rows.length} anni
- Probabilità di Exit: 44.14%
- Valutazione DCF e Multipli:
  * DCF 2027: €3,084,613.08
  * DCF 2030: €79,849,756.09
  * TV 2027: €89,465,156.53
  * TV 2030: €165,129,475.31

# INDICATORI CHIAVE
- Exit 2027: 15.00%
- RVC: 38.55%
- P (DCF): 38.55%
- T (DCF): 7 anni
- Retention: 50%

# CONFRONTO TEMPORALE
- PV degli Investimenti:
  * DCF 2027: €8,799,877.35
  * DCF 2030: €13,262,431.74
- Valutazione Relativa:
  * Exit 2027: €3,859,546.77
  * Exit 2030: €9,922,927.88

# ROUND DI INVESTIMENTO
- Pre-money: €6,800,000.00
- Invested: €1,250,000.00
- % Proposta (1.25 MLN invested): 15.53%
- Valutazione parziale:
  * 2027: €1,366,440.58
  * 2030: €1,530,985.52

# SUGGERIMENTI STRATEGICI
1. Visualizzare la probabilità di exit (44.14%) con un grafico a torta
2. Confrontare i valori TV tra 2027 e 2030 con grafici a barre affiancati
3. Mostrare il valore attuale degli investimenti DCF vs RELATIVE
4. Utilizzare un grafico a cascata per l'evoluzione dell'investimento
5. Confrontare pre-money, investimento e valutazione parziale

Assicurati di formattare tutti i valori monetari in euro con il simbolo € e le migliaia separate da punto.
Usa il formato markdown per strutturare l'output.
`.trim();

    // Configura e inizializza il modello Gemini
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('Chiave API di Google non configurata');
      return NextResponse.json(
        { 
          success: false, 
          details: 'Errore di configurazione: chiave API mancante' 
        },
        { status: 500 }
      );
    }

    console.log('Configurazione modello Gemini con chiave API');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    });

    console.log('Invio richiesta al modello Gemini Flash 2.0');

    // Genera l'analisi
    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
    
    const response = await result.response;
    let analysis = response.text();

    // Formatta i numeri nell'analisi
    analysis = analysis.replace(/(\d+),(\d{3})/g, '$1.$2');
    analysis = analysis.replace(/(\d+)\s*(?:EUR|euro|€)?/gi, (match) => {
      const num = parseFloat(match.replace(/[^\d.-]/g, ''));
      if (!isNaN(num)) {
        return new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num);
      }
      return match;
    });

    // Assicura la corretta formattazione markdown
    analysis = analysis.replace(/^#\s/gm, '# ');
    analysis = analysis.replace(/^##\s/gm, '## ');
    analysis = analysis.replace(/^-\s/gm, '- ');
    analysis = analysis.replace(/\n{3,}/g, '\n\n');

    // Genera le visualizzazioni
    const charts = generateChartConfigurations(headers, rows, columnTypes);

    console.log('Analisi completata:', {
      hasAnalysis: !!analysis,
      chartsGenerated: charts.length
    });

    return NextResponse.json({
      success: true,
      analysis: analysis,
      visualizations: charts
    });

  } catch (error) {
    console.error('Errore durante l\'elaborazione:', error);
    return NextResponse.json(
      { 
        success: false, 
        details: `Errore durante l'elaborazione: ${error.message}` 
      },
      { status: 500 }
    );
  }
}

function parseAnalysisResponse(analysis) {
  // Tenta di strutturare la risposta dell'AI in sezioni
  const sections = {
    trends: [],
    kpis: [],
    suggestions: [],
    predictions: [],
    risks: []
  };

  try {
    // Cerca di identificare le sezioni nel testo
    const lines = analysis.split('\n');
    let currentSection = null;

    lines.forEach(line => {
      if (line.toLowerCase().includes('trend')) {
        currentSection = 'trends';
      } else if (line.toLowerCase().includes('kpi') || line.toLowerCase().includes('indicatore')) {
        currentSection = 'kpis';
      } else if (line.toLowerCase().includes('suggeriment') || line.toLowerCase().includes('miglioramento')) {
        currentSection = 'suggestions';
      } else if (line.toLowerCase().includes('previsioni') || line.toLowerCase().includes('forecast')) {
        currentSection = 'predictions';
      } else if (line.toLowerCase().includes('rischi') || line.toLowerCase().includes('criticità')) {
        currentSection = 'risks';
      } else if (currentSection && line.trim()) {
        sections[currentSection].push(line.trim());
      }
    });
  } catch (error) {
    console.error('Errore nel parsing dell\'analisi:', error);
  }

  return sections;
}

function extractMetricsFromAnalysis(data, analysis) {
  const metrics = {
    timeSeries: [],
    numericalColumns: {},
    keyMetrics: {}
  };

  try {
    // Identifica possibili colonne temporali
    const columns = Object.keys(data[0]);
    columns.forEach(column => {
      const sample = data[0][column];
      if (isDateLike(sample)) {
        metrics.timeSeries = data.map(row => row[column]);
      } else if (isNumeric(sample)) {
        metrics.numericalColumns[column] = data.map(row => parseFloat(row[column]));
      }
    });

    // Calcola alcune metriche di base per le colonne numeriche
    Object.keys(metrics.numericalColumns).forEach(column => {
      const values = metrics.numericalColumns[column];
      metrics.keyMetrics[column] = {
        average: average(values),
        max: Math.max(...values),
        min: Math.min(...values),
        trend: calculateTrend(values)
      };
    });
  } catch (error) {
    console.error('Errore nell\'estrazione delle metriche:', error);
  }

  return metrics;
}

function generateDynamicVisualizations(data, metrics) {
  const visualizations = {};

  try {
    // Crea visualizzazioni per ogni serie numerica identificata
    Object.keys(metrics.numericalColumns).forEach(column => {
      visualizations[`${column}Chart`] = {
        type: 'line',
        data: {
          labels: metrics.timeSeries.length ? metrics.timeSeries : Array.from({length: data.length}, (_, i) => i + 1),
          datasets: [{
            label: column,
            data: metrics.numericalColumns[column],
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.4
          }]
        }
      };
    });

    // Se ci sono almeno due serie numeriche, crea un grafico di correlazione
    const numericColumns = Object.keys(metrics.numericalColumns);
    if (numericColumns.length >= 2) {
      visualizations.correlationChart = {
        type: 'scatter',
        data: {
          datasets: [{
            label: `${numericColumns[0]} vs ${numericColumns[1]}`,
            data: data.map(row => ({
              x: parseFloat(row[numericColumns[0]]),
              y: parseFloat(row[numericColumns[1]])
            })),
            backgroundColor: 'rgba(26, 115, 232, 0.5)'
          }]
        }
      };
    }
  } catch (error) {
    console.error('Errore nella generazione delle visualizzazioni:', error);
  }

  return visualizations;
}

// Funzioni di utilità
function isDateLike(value) {
  if (!value) return false;
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}/, // DD-MM-YYYY
    /^[A-Za-z]{3,9}\s+\d{4}/ // Month YYYY
  ];
  return datePatterns.some(pattern => pattern.test(value.toString()));
}

function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function average(array) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}

function calculateTrend(values) {
  const n = values.length;
  if (n < 2) return 0;
  return (values[n - 1] - values[0]) / values[0] * 100;
}

function getRandomColor() {
  const colors = ['#1a73e8', '#4CAF50', '#f44336', '#ff9800', '#9c27b0', '#795548'];
  return colors[Math.floor(Math.random() * colors.length)];
} 