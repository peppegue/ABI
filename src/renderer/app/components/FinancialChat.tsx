import React, { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface FinancialChatProps {
  messages?: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

const FinancialChat: React.FC<FinancialChatProps> = ({ 
  messages = [], 
  onSendMessage,
  isLoading = false 
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await onSendMessage(input);
    setInput('');
  };

  return (
    <div className="bg-white rounded-xl p-4 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Analisi Finanziaria AI</h3>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nessun messaggio disponibile.</p>
            <p className="text-sm">Carica un file Excel e fai domande sui dati.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p>{message.text}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Fai una domanda sui dati..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Invia
        </button>
      </form>
    </div>
  );
};

export default FinancialChat; 