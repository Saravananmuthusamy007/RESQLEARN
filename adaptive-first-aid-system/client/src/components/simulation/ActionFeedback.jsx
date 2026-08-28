// ActionFeedback.jsx - Toast notification component for action feedback

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const ActionFeedback = ({ feedback = null }) => {
  if (!feedback || !feedback.message) return null;

  const { message, isCorrect } = feedback;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-md">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-white backdrop-blur-md ${
          isCorrect
            ? 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-950/50'
            : 'bg-rose-950/90 border-rose-500/50 shadow-rose-950/50'
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className={`text-sm font-bold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
            {isCorrect ? 'Correct Action' : 'Action Warning'}
          </h4>
          <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ActionFeedback;
