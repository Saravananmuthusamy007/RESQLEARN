import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Bot, Send, Sparkles, User, Shield, BarChart3, AlertCircle } from 'lucide-react';

export const AdminAIPartnerPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'model',
      text: `Greetings, Medical Director. I am your **ResqLearn Executive Simulation AI Assistant** powered by Gemini 2.5 Flash.\n\nI can analyze:\n• **Cohort pass rates & telemetry patterns**\n• **Common clinical failure points and weak areas**\n• **Curriculum scoring adjustments and recommendations**\n• **BLS clinical guidelines and evidence standards**\n\nHow may I assist your simulation review today?`,
      source: 'gemini-2.5-flash',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Summarize current learner pass rates and high-risk procedural areas.',
    'What are the most common telemetry mistakes detected across all levels?',
    'Should we adjust the compression rate threshold for Level 1 CPR?',
    'Provide recommendations to improve hemorrhage control simulation outcomes.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (messageToSend) => {
    const text = messageToSend || inputMessage;
    if (!text.trim() || isSending) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const history = messages.map(m => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.post('/learning-partner/chat', {
        message: text.trim(),
        history,
      });

      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            sender: 'model',
            text: res.message,
            source: res.source,
          },
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          sender: 'model',
          text: 'Unable to communicate with the executive intelligence engine at this time.',
          source: 'error',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Executive Simulation Intelligence</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Gemini 2.5 Flash</span>
              </span>
            </h1>
            <p className="text-xs text-slate-400">Curriculum Optimization & Telemetry Analytics</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-xs text-purple-400 font-mono">
          <Shield className="w-4 h-4" />
          <span>Director Authorization</span>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-2 scrollbar-none text-xs">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isSending}
            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white whitespace-nowrap transition-colors flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-purple-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-purple-950/70 border border-purple-800 text-purple-100 rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {!isUser && m.source && (
                  <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 flex items-center space-x-1">
                    <span>Engine:</span>
                    <span className="text-purple-400 font-bold">{m.source}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-purple-400 font-mono p-2">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Consulting platform data and Gemini AI...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about pass rates, learner trends, or clinical simulation logic..."
          className="w-full pl-4 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors shadow-lg"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputMessage.trim() || isSending}
          className="absolute right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminAIPartnerPage;
