import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 border-slate-700 text-white';
          let icon = <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-emerald-950 border-emerald-700 text-emerald-100';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-rose-950 border-rose-700 text-rose-100';
            icon = <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-950 border-amber-700 text-amber-100';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border shadow-2xl transition-all duration-300 transform translate-y-0 ${bg}`}
            >
              {icon}
              <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white p-0.5 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside ToastProvider
    return {
      addToast: (msg) => console.log(msg),
      removeToast: () => {}
    };
  }
  return context;
};

export default ToastProvider;
