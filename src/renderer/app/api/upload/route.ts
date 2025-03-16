import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file caricato' },
        { status: 400 }
      );
    }

    // Verifica il tipo di file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Il file deve essere in formato Excel (.xlsx o .xls)' },
        { status: 400 }
      );
    }

    // Leggi il file Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Prendi il primo foglio
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Converti in JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    return NextResponse.json({
      message: 'File caricato con successo',
      data: data
    });
  } catch (error) {
    console.error('Errore durante il caricamento del file:', error);
    return NextResponse.json(
      { error: 'Errore durante il caricamento del file' },
      { status: 500 }
    );
  }
} 