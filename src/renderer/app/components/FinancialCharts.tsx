'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registra i componenti necessari di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FinancialChartsProps {
  data?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Nessun dato disponibile per i grafici.</p>
        <p className="text-sm">Carica un file Excel per visualizzare l'analisi.</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Analisi Finanziaria'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `€${value.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default FinancialCharts; 