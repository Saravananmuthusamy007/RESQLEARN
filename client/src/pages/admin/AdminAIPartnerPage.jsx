import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Shield,
  BarChart3,
  Database,
  RotateCcw,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const ADMIN_SUGGESTED_PROMPTS = [
  'How many learners are registered?',
  'How many learners completed Level 1?',
  'Which level has the lowest completion rate?',
  'What is the average practical score for Level 2?',
  'What are the most common simulation mistakes?',
  'How many certificates have been issued?',
  'Summarize platform performance and learner mastery.',
  'Show me the pass/fail breakdown for assessments.',
];

export const AdminAIPartnerPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'model',
      text: `Greetings, Administrator. I am your **ResqLearn AI Analytics Assistant** powered by the **Google Gemini API** and grounded strictly in **live MongoDB platform data**.\n\nI can answer questions regarding:\n• **Total & active learner cohorts**\n• **Real-time level completion & pass rates**\n• **Practical telemetry scores & common procedural mistakes**\n• **Assessment performance, weak areas, and certificate issuance**\n\nAll metrics are queried directly from the database—I do not fabricate platform numbers. What would you like to investigate?`,
      source: 'gemini-2.5-flash',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastErrorPrompt, setLastErrorPrompt] = useState(null);
  const [lastDataTimestamp, setLastDataTimestamp] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);
    setLastErrorPrompt(null);

    try {
      // Format last 10 conversation turns
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const res = await api.post('/admin/ai/chat', {
        message: text,
        conversationHistory,
      });

      if (res.success) {
        const replyText = res.reply || res.message || 'Analytics report prepared.';
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            sender: 'model',
            text: replyText,
            source: res.source || 'gemini-2.5-flash',
            timestamp: res.dataTimestamp || new Date().toISOString(),
          },
        ]);

        if (res.dataTimestamp) {
          setLastDataTimestamp(res.dataTimestamp);
        }
      }
    } catch (err) {
      console.error('[Admin AI Error]:', err);
      setLastErrorPrompt(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `model-error-${Date.now()}`,
          sender: 'model',
          text: 'The AI analytics assistant is temporarily unavailable. Please click **Retry** below or check platform connectivity.',
          source: 'error',
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Reset the Admin AI Analytics conversation session?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'model',
          text: `Analytics session reset. Ask any question about live learner counts, completion rates, simulation mistakes, or certification metrics.`,
          source: 'gemini-2.5-flash',
        },
      ]);
      setLastErrorPrompt(null);
    }
  };

  const handleRetry = () => {
    if (lastErrorPrompt) {
      handleSend(lastErrorPrompt);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-3 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Admin AI Analytics Assistant</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Gemini 2.5 Flash</span>
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Live Database-Grounded Intelligence & Platform Reporting
            </p>
          </div>
        </div>

        {/* Status Indicators & Reset */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Live MongoDB Grounded</span>
          </div>

          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Prompts Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 px-1">
          <span className="flex items-center space-x-1">
            <BarChart3 className="w-3 h-3 text-purple-400" />
            <span>Platform queries (click to run or type your custom inquiry):</span>
          </span>
          {lastDataTimestamp && (
            <span className="text-slate-500 font-mono text-[10px] flex items-center space-x-1">
              <Clock className="w-2.5 h-2.5" />
              <span>Queried: {new Date(lastDataTimestamp).toLocaleTimeString()}</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {ADMIN_SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isSending}
              className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-3 shadow-inner">
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
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : m.isError
                    ? 'bg-rose-950 border border-rose-800 text-rose-300'
                    : 'bg-slate-800 border border-slate-700 text-purple-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-purple-950/70 border border-purple-800 text-purple-100 rounded-tr-none'
                    : m.isError
                    ? 'bg-rose-950/40 border border-rose-900/60 text-rose-200 rounded-tl-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                  {m.source && (
                    <span className="flex items-center space-x-1">
                      <span>Engine:</span>
                      <span className="text-purple-300 font-semibold">
                        {m.source === 'live-db-analytics'
                          ? 'MongoDB Live Intelligence'
                          : m.source.startsWith('gemini')
                          ? `Google ${m.source}`
                          : m.source}
                      </span>
                    </span>
                  )}
                  {m.isError && lastErrorPrompt && (
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center space-x-1 text-rose-400 hover:text-rose-300 font-bold ml-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isSending && (
          <div className="flex items-center space-x-3 p-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-purple-300 text-xs flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Querying MongoDB & synthesizing report via Gemini...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isSending}
          placeholder="Ask any question about live learner counts, pass rates, mistakes, or certificates..."
          className="w-full pl-4 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors shadow-lg"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="absolute right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Grounding Notice Footer */}
      <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center space-x-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span>
          Metrics and figures are sourced from active MongoDB collections. Gemini never invents platform statistics.
        </span>
      </div>
    </div>
  );
};

export default AdminAIPartnerPage;
