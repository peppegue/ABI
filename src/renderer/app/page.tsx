'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">ABI - Analisi Business Intelligence</h1>
      <p className="text-lg text-gray-600">
        Benvenuto nel tuo assistente di analisi dati
      </p>
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => console.log('Button clicked')}
      >
        Test Button
      </button>
    </div>
  );
} 