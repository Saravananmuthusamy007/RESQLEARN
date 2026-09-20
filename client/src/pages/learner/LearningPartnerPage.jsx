import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';

const LEVELS = [
  { id: 'auto', name: 'Auto (Active Level)', num: null },
  { id: 'level1', name: 'Level 1: CPR & AED', num: 1 },
  { id: 'level2', name: 'Level 2: Hemorrhage Control', num: 2 },
  { id: 'level3', name: 'Level 3: Burn Stabilization', num: 3 },
  { id: 'level4', name: 'Level 4: Choking Relief', num: 4 },
  { id: 'level5', name: 'Level 5: Fracture Splinting', num: 5 },
];

const SUGGESTED_BY_LEVEL = {
  auto: [
    'What should I do first in an emergency?',
    'What is the correct compression depth in CPR?',
    'Why should I never put ice on a burn?',
    'What mistakes did I make in my recent simulation?',
    'Explain the Two-Joint Rule for splints in simple words.',
  ],
  level1: [
    'What is the correct compression depth in CPR?',
    'Why does complete chest recoil matter?',
    'Explain the CPR procedure step by step.',
    'What should I do if the person is unconscious?',
    'What mistakes did I make in my CPR simulation?',
  ],
  level2: [
    'Where exactly do I apply a tourniquet?',
    'What is the difference between direct pressure and a tourniquet?',
    'Why should I never loosen a tourniquet once placed?',
    'Explain Level 2 bleeding control in simple words.',
  ],
  level3: [
    'Why should I not apply ice or butter to a burn?',
    'Why must rings and tight jewelry be removed early in burns?',
    'Explain Level 3 burn stabilization step by step.',
    'How do I handle chemical burns compared to thermal burns?',
  ],
  level4: [
    'Where do I position my hands for abdominal thrusts (Heimlich)?',
    'What should I do if a choking person loses consciousness?',
    'Why should I avoid blind finger sweeps?',
    'Explain choking relief for an infant vs adult.',
  ],
  level5: [
    'What is the Two-Joint Rule in fracture splinting?',
    'Why must I check PMS (Pulse, Motor, Sensory) before and after splinting?',
    'How do I immobilize an open fracture without worsening pain?',
    'Explain Level 5 fracture stabilization step by step.',
  ],
};

export const LearningPartnerPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('auto');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'model',
      text: `Hello! I am your **ResqLearn AI Emergency Training Partner** powered by the real **Google Gemini API**.\n\nI am dynamically linked to your training curriculum and simulation performance. You can ask me any natural first-aid question or request step-by-step clinical explanations.\n\n**Try asking:**\n• "Why does full recoil matter in CPR?"\n• "What mistakes did I make in my simulation?"\n• "Explain Level 3 burn stabilization step by step."\n• "What is the difference between direct pressure and a tourniquet?"`,
      source: 'gemini-2.5-flash',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastErrorPrompt, setLastErrorPrompt] = useState(null);
  const [activeLevelInfo, setActiveLevelInfo] = useState(null);
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
      // Build safe conversation history (last 10 turns)
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const payload = {
        message: text,
        levelId: selectedLevel === 'auto' ? undefined : selectedLevel,
        conversationHistory,
      };

      const res = await api.post('/learning-partner/chat', payload);

      if (res.success) {
        const replyText = res.reply || res.message || 'Educational guidance received.';
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            sender: 'model',
            text: replyText,
            source: res.source || 'gemini-2.5-flash',
          },
        ]);
        if (res.currentLevel) {
          setActiveLevelInfo(res.currentLevel);
        }
      }
    } catch (err) {
      console.error('[Learner AI Error]:', err);
      setLastErrorPrompt(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `model-error-${Date.now()}`,
          sender: 'model',
          text: 'The AI Learning Partner is temporarily unavailable. Please verify your connection or click **Retry** below.',
          source: 'offline-fallback',
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Reset conversation history with your AI Learning Partner?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'model',
          text: `Conversation reset. I am ready for your next question! Ask about CPR depth, tourniquet protocols, burn cooling, or any BLS scenario.`,
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

  const currentPrompts = SUGGESTED_BY_LEVEL[selectedLevel] || SUGGESTED_BY_LEVEL.auto;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-3 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/30 flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>AI Learning Partner</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Gemini 2.5 Flash</span>
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Conversational BLS Educational Assistant & Simulation Remediator
            </p>
          </div>
        </div>

        {/* Level Selector & Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Level Context Select */}
          <div className="relative flex items-center">
            <Layers className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer appearance-none"
              title="Select Curriculum Context for Gemini"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id} className="bg-slate-900 text-white">
                  {lvl.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Reset Chat Button */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Clear Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Prompt Shortcuts Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 px-1">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Suggested questions (click to ask or type your own below):</span>
          </span>
          {activeLevelInfo && (
            <span className="text-cyan-400 font-mono text-[10px]">
              Active: Level {activeLevelInfo.levelNumber} - {activeLevelInfo.title}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {currentPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isSending}
              className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
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
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                    : m.isError
                    ? 'bg-rose-950 border border-rose-800 text-rose-300'
                    : 'bg-purple-950 border border-purple-800 text-purple-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-cyan-950/70 border border-cyan-800 text-cyan-100 rounded-tr-none'
                    : m.isError
                    ? 'bg-rose-950/40 border border-rose-900/60 text-rose-200 rounded-tl-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                  {m.source && (
                    <span className="flex items-center space-x-1">
                      <span>Source:</span>
                      <span className="text-cyan-300 font-semibold">
                        {m.source === 'curriculum-clinical-tutor'
                          ? 'ResqLearn Clinical Tutor'
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

        {/* Real-time Loading Indicator */}
        {isSending && (
          <div className="flex items-center space-x-3 p-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-purple-300 text-xs flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Gemini is formulating clinical guidance...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
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
          placeholder="Ask any natural first-aid question (e.g., 'Why does compression depth matter?', 'Explain Level 2 steps')..."
          className="w-full pl-4 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-colors shadow-lg"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="absolute right-2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Clinical Safety Banner */}
      <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center space-x-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span>
          ResqLearn AI provides educational simulation guidance. In a life-threatening emergency, immediately contact local emergency services (EMS/911).
        </span>
      </div>
    </div>
  );
};

export default LearningPartnerPage;
