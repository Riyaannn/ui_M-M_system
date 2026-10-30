import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[#FB7185] text-xs flex items-start gap-2.5 animate-slide-up"
    >
      <AlertCircle className="w-4 h-4 text-[#FB7185] flex-shrink-0 mt-0.5" />
      <span className="leading-relaxed font-medium">{message}</span>
    </div>
  );
};
