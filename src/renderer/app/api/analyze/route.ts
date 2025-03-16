import { NextResponse } from 'next/server';

interface ExcelData {
  [key: string]: any[];
}

function analyzeData(data: ExcelData) {
  // Analizza le colonne per identificare i tipi di dati
  const metrics = [];
  const chartData = {
    labels: [],
    datasets: []
  };

  try {
    // Analizza le colonne numeriche per trovare metriche chiave
    Object.entries(data).forEach(([columnName, values]) => {
      if (typeof values[0] === 'number') {
        // Calcola statistiche di base
        const sum = values.reduce((a, b) => a + (b || 0), 0);
        const avg = sum / values.length;
        const max = Math.max(...values.filter(v => v !== null));
        const min = Math.min(...values.filter(v => v !== null));
        
        // Calcola il trend
        const trend = values.length > 1 ? 
          ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;

        // Aggiungi metrica
        metrics.push({
          id: columnName.toLowerCase().replace(/\s+/g, '_'),
          iconName: getIconForMetric(columnName),
          iconColor: getColorForTrend(trend),
          value: formatValue(sum, columnName),
          label: formatLabel(columnName),
          trend: { 
            value: Math.abs(trend).toFixed(1),
            isPositive: trend > 0 
          }
        });

        // Aggiungi dataset per il grafico
        chartData.datasets.push({
          label: columnName,
          data: values,
          borderColor: getChartColor(metrics.length),
          backgroundColor: getChartColor(metrics.length, 0.5),
        });
      } else if (typeof values[0] === 'string' && !chartData.labels.length) {
        // Usa la prima colonna di stringhe come labels (es. date, mesi, etc.)
        chartData.labels = values;
      }
    });

    return {
      dashboardData: {
        metrics,
        chartData
      },
      welcomeMessage: generateWelcomeMessage(metrics)
    };
  } catch (error) {
    console.error('Error analyzing data:', error);
    throw new Error('Failed to analyze data');
  }
}

function getIconForMetric(columnName: string): string {
  const name = columnName.toLowerCase();
  if (name.includes('vend') || name.includes('revenue') || name.includes('ricav')) return 'dollar-sign';
  if (name.includes('client') || name.includes('customer')) return 'users';
  if (name.includes('growth') || name.includes('crescita')) return 'trending-up';
  return 'bar-chart';
}

function getColorForTrend(trend: number): string {
  if (trend > 10) return 'text-green-500';
  if (trend > 0) return 'text-blue-500';
  if (trend > -10) return 'text-yellow-500';
  return 'text-red-500';
}

function formatValue(value: number, columnName: string): string {
  const name = columnName.toLowerCase();
  if (name.includes('euro') || name.includes('revenue') || name.includes('ricav')) {
    return `€${value.toLocaleString('it-IT')}`;
  }
  if (name.includes('percent') || name.includes('percentuale')) {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString('it-IT');
}

function formatLabel(columnName: string): string {
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getChartColor(index: number, alpha: number = 1): string {
  const colors = [
    `rgba(75, 192, 192, ${alpha})`,
    `rgba(53, 162, 235, ${alpha})`,
    `rgba(255, 99, 132, ${alpha})`,
    `rgba(255, 206, 86, ${alpha})`,
  ];
  return colors[index % colors.length];
}

function generateWelcomeMessage(metrics: any[]): string {
  const positiveMetrics = metrics.filter(m => m.trend.isPositive);
  const negativeMetrics = metrics.filter(m => !m.trend.isPositive);

  if (positiveMetrics.length > negativeMetrics.length) {
    return `Ho analizzato i tuoi dati. Noto un trend positivo generale, in particolare per ${positiveMetrics[0].label.toLowerCase()}. Come posso aiutarti a comprendere meglio questi risultati?`;
  } else if (negativeMetrics.length > positiveMetrics.length) {
    return `Ho analizzato i tuoi dati. Ci sono alcune aree che richiedono attenzione, in particolare ${negativeMetrics[0].label.toLowerCase()}. Vuoi che ti aiuti ad analizzare le possibili cause?`;
  }
  return 'Ho analizzato i tuoi dati. Cosa vorresti sapere nello specifico?';
}

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    const analysis = analyzeData(data);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing data:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'analisi dei dati' },
      { status: 500 }
    );
  }
} 