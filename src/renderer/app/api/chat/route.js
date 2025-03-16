import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { message, context, previousMessages } = await request.json();
    
    // Configura il client di Google Gemini
    const genAI = new GoogleGenerativeAI('AIzaSyBkX_q40wgDdEKWEAHaSmohrZXbid_8i_U');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepara il contesto della conversazione
    const conversationHistory = previousMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const prompt = `Sei un esperto analista finanziario specializzato nell'analisi di bilanci e dati finanziari. 
Rispondi in modo dettagliato e professionale, utilizzando i dati disponibili per supportare le tue affermazioni.

Contesto dei dati finanziari:
${context}

Storico della conversazione:
${conversationHistory}

Domanda dell'utente: ${message}

Se vengono richieste visualizzazioni specifiche, suggerisci il tipo di grafico più appropriato per rappresentare l'informazione richiesta.`;

    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
    
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({
      success: true,
      reply: reply.trim()
    });

  } catch (error) {
    console.error('Errore nella chat:', error);
    return NextResponse.json({ 
      error: 'Errore interno',
      details: error.message
    }, { status: 500 });
  }
} 