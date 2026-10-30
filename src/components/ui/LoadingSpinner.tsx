import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string; fullScreen?: boolean }> = ({
  label = 'Loading...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0D0B12]/85 backdrop-blur-md flex flex-col items-center justify-center z-50">
        <div className="w-14 h-14 rounded-2xl bg-[#191521] border border-[#30263E] flex items-center justify-center mb-4 shadow-glow-violet-sm">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-[#F5F3FA]">{label}</p>
        <span className="text-xs text-[#777084] mt-1">M&M &bull; Mentor & Mentee</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="w-7 h-7 text-violet-400 animate-spin mb-2.5" />
      <p className="text-xs text-[#AAA2B8] font-medium">{label}</p>
    </div>
  );
};
