declare global {
  interface Window {
    electronAPI: {
      loadExcel: (buffer: ArrayBuffer) => Promise<{
        success: boolean;
        data?: any[];
        error?: string;
      }>;
      analyzeData: (data: any) => Promise<{
        success: boolean;
        analysis?: {
          welcomeMessage: string;
          metrics: any[];
          chartData: any;
        };
        error?: string;
      }>;
      askAI: (question: string) => Promise<{
        success: boolean;
        response?: string;
        error?: string;
      }>;
    }
  }
}

export {}; 