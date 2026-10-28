import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string; fullScreen?: boolean }> = ({
  label = 'Loading...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-xs flex flex-col items-center justify-center z-50">
        <Loader2 className="w-10 h-10 text-nmam-navy-800 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="text-xs text-slate-400 mt-1">NMAMIT Mentor–Mentee Management System</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="w-7 h-7 text-nmam-navy-700 animate-spin mb-2" />
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  );
};
