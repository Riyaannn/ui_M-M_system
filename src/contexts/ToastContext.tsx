import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'info', title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (msg, title) => addToast(msg, 'success', title),
        error: (msg, title) => addToast(msg, 'error', title),
        info: (msg, title) => addToast(msg, 'info', title),
      }}
    >
      {children}

      {/* Toast container */}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-slide-up bg-[#191521] ${
              t.type === 'success'
                ? 'border-[#4ADEA8]/40 text-[#F5F3FA]'
                : t.type === 'error'
                ? 'border-[#FB7185]/40 text-[#F5F3FA]'
                : 'border-violet-500/40 text-[#F5F3FA]'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#4ADEA8]" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#FB7185]" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-violet-400" />}
            </div>

            <div className="flex-1 text-xs">
              {t.title && <div className="font-bold text-[#F5F3FA] text-sm mb-0.5">{t.title}</div>}
              <div className="text-[#AAA2B8] leading-relaxed">{t.message}</div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-[#777084] hover:text-[#F5F3FA] p-1 rounded-lg hover:bg-[#211A2D] transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
