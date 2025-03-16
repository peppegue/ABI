import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, fileData, history } = await request.json();

    // Qui dovresti chiamare il tuo modello AI per analizzare il messaggio
    // e generare una risposta basata sui dati e sulla cronologia della chat
    // Per ora simuliamo una risposta

    // Esempio di analisi del messaggio per parole chiave
    const lowerMessage = message.toLowerCase();
    let response = '';
    let updatedDashboard = null;
    let updatedCharts = null;

    if (lowerMessage.includes('vendite')) {
      response = 'Dalle analisi emerge un trend positivo nelle vendite, con una crescita del 15.2% rispetto all\'anno precedente. Le regioni più performanti sono Italia e Germania.';
    } else if (lowerMessage.includes('clienti')) {
      response = 'Abbiamo acquisito 1,240 nuovi clienti quest\'anno, con un tasso di fidelizzazione dell\'85%. La maggior parte proviene dal settore tecnologico.';
    } else if (lowerMessage.includes('previsioni') || lowerMessage.includes('forecast')) {
      response = 'Le previsioni indicano una crescita continua nei prossimi mesi, con un potenziale aumento del 23.8% entro fine anno.';
    } else if (lowerMessage.includes('team')) {
      response = 'Il team di vendita sta performando bene, con Laura Bianchi che ha già superato il target annuale. Marco Rossi è all\'85% del suo obiettivo.';
    } else {
      response = 'Posso aiutarti con informazioni su vendite, clienti, previsioni o performance del team. Cosa ti interessa sapere nello specifico?';
    }

    return NextResponse.json({
      response,
      updatedDashboard,
      updatedCharts
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'elaborazione del messaggio' },
      { status: 500 }
    );
  }
} 