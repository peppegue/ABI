// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Inizializza il client Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Endpoint per l’ingestione dati e l’analisi AI
 */
app.post('/analyze', async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload) {
      return res.status(400).json({ error: 'Payload non fornito' });
    }

    // Inserisci i dati grezzi in Supabase
    const { data: insertedData, error: insertError } = await supabase
      .from('data_ingestion')
      .insert([{ payload }])
      .select();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // Chiamata all’API di DeepSeek (o tramite Cursor)
    const aimlapiResponse = await axios.post(
      'https://docs.aimlapi.com/', // verifica l'endpoint corretto consultando la documentazione di AIMLAPI
      { data: payload },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIMLAPI_KEY}`,  // Assicurati di aggiornare il nome della variabile in .env
          'Content-Type': 'application/json'
        }
      }
    );
    
    const reportText = aimlapiResponse.data.report || 'Nessun report generato';
     

    // Inserisci il report AI in Supabase collegandolo al dato inserito
    const { data: reportData, error: reportError } = await supabase
      .from('ai_reports')
      .insert([{ data_id: insertedData[0].id, report_text: reportText }])
      .select();

    if (reportError) {
      return res.status(500).json({ error: reportError.message });
    }

    return res.status(200).json({ 
      message: 'Analisi completata', 
      data: { raw: insertedData[0], report: reportData[0] } 
    });
  } catch (error) {
    console.error('Errore nel processing:', error);
    return res.status(500).json({ error: 'Errore durante l\'analisi' });
  }
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
