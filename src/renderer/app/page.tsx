'use client';

import { useState, useEffect } from 'react';
import FinancialCharts from './components/FinancialCharts';
import FinancialChat from './components/FinancialChat';
import MetricCard from './components/Dashboard/MetricCard';
import { FiUsers, FiUpload, FiDollarSign, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

declare global {
  interface Window {
    electronAPI: {
      loadExcel: (filePath: string) => Promise<any>;
      analyzeData: (data: any) => Promise<any>;
      askAI: (question: string) => Promise<any>;
    }
  }
}

const iconMap = {
  'users': FiUsers,
  'dollar-sign': FiDollarSign,
  'trending-up': FiTrendingUp,
  'bar-chart': FiBarChart2
};

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: string;
  }>>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    setIsUploading(true);
    try {
      const filePath = event.target.files[0].path;
      const result = await window.electronAPI.loadExcel(filePath);
      
      if (result.success) {
        setFile(event.target.files[0]);
        const analysisResult = await window.electronAPI.analyzeData(result.data);
        if (analysisResult.success) {
          setDashboardData(analysisResult.analysis);
          setAnalysisData(analysisResult.analysis.chartData);
          setChatMessages([
            {
              id: '1',
              text: analysisResult.analysis.welcomeMessage,
              sender: 'assistant',
              timestamp: new Date().toISOString(),
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      setChatMessages([
        {
          id: '1',
          text: 'Si è verificato un errore nel caricamento del file.',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsChatLoading(true);
    
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await window.electronAPI.askAI(message);
      if (response.success) {
        setChatMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: response.response,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        }]);

        if (response.updatedDashboard) {
          setDashboardData(response.updatedDashboard);
          setAnalysisData(response.updatedDashboard.chartData);
        }
      }
    } catch (error) {
      console.error('Errore nella richiesta all\'AI:', error);
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Si è verificato un errore nella richiesta.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getIconComponent = (iconName: string, className: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-semibold">Analisi Dati Excel</h1>
          <div className="flex items-center space-x-4">
            <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FiUpload className="w-5 h-5" />
              <span>Carica Excel</span>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {file && (
              <span className="text-sm text-gray-600">
                {isUploading ? 'Analisi in corso...' : file.name}
              </span>
            )}
          </div>
        </div>

        {!file ? (
          // Stato iniziale
          <div className="bg-white p-12 rounded-xl shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Carica un file Excel per iniziare</h2>
            <p className="text-gray-500">
              Carica il tuo file Excel per ricevere un'analisi dettagliata dei dati e interagire con l'assistente AI.
            </p>
          </div>
        ) : (
          // Dashboard con analisi
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardData?.metrics?.map((metric: any) => (
                <MetricCard
                  key={metric.id}
                  icon={getIconComponent(metric.iconName, `w-6 h-6 ${metric.iconColor}`)}
                  value={metric.value}
                  label={metric.label}
                  trend={metric.trend}
                />
              ))}
            </div>

            {/* Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Grafici</h2>
                <FinancialCharts data={analysisData} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Assistente AI</h2>
                <FinancialChat 
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isChatLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 