import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#191521] rounded-2xl border border-dashed border-[#30263E] shadow-card-dark">
      <div className="w-14 h-14 rounded-2xl bg-[#211A2D] border border-[#30263E] text-violet-400 flex items-center justify-center mb-4 shadow-inner">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-[#F5F3FA]">{title}</h4>
      <p className="text-xs sm:text-sm text-[#AAA2B8] max-w-md mt-1.5 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
