import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const ChatContainer = styled.div`
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 500px;
  margin-top: 2rem;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  line-height: 1.5;

  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #1a73e8;
    color: white;
  ` : `
    align-self: flex-start;
    background-color: #f5f5f5;
    color: #333;
  `}
`;

const ChatInput = styled.div`
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: #1a73e8;
    }
  }

  button {
    padding: 0.75rem;
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: #1557b0;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
`;

export default function AIChat({ analysisData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          analysisContext: analysisData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nella risposta');
      }

      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Errore chat:', error);
      setMessages(prev => [...prev, { 
        text: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h3>Chat con l'Analista AI</h3>
      </ChatHeader>

      <ChatMessages>
        {messages.map((msg, idx) => (
          <Message key={idx} isUser={msg.isUser}>
            {msg.text}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInput>
        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Fai una domanda sull'analisi..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </ChatInput>
    </ChatContainer>
  );
} 