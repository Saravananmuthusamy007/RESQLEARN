import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const VisualFeedback = ({ feedbackEvent }) => {
  const [activeFeedback, setActiveFeedback] = useState(null);

  useEffect(() => {
    if (!feedbackEvent) return;
    setActiveFeedback(feedbackEvent);
    const timer = setTimeout(() => {
      setActiveFeedback(null);
    }, 2200);
    return () => clearTimeout(timer);
  }, [feedbackEvent]);

  if (!activeFeedback) return null;

  const isSuccess = activeFeedback.type === 'success';
  const isWarning = activeFeedback.type === 'warning';
  const isError = activeFeedback.type === 'error';

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div
        className={`px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 text-sm font-semibold border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-emerald-500/20'
            : isWarning
            ? 'bg-amber-950/90 text-amber-200 border-amber-500/60 shadow-amber-500/20'
            : 'bg-rose-950/90 text-rose-200 border-rose-500/60 shadow-rose-500/20'
        }`}
      >
        {isSuccess && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
        {isWarning && <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
        {isError && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
        <span>{activeFeedback.message}</span>
      </div>
    </div>
  );
};

export default VisualFeedback;
