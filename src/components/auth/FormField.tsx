import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  rightLabel?: ReactNode;
  children: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  rightLabel,
  children,
}) => {
  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="block font-semibold uppercase tracking-wider text-[#AAA2B8] text-[11px]">
          {label}
        </label>
        {rightLabel}
      </div>

      {children}

      {error ? (
        <p className="text-[11px] text-[#FB7185] font-medium animate-slide-up" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#777084]">{helperText}</p>
      ) : null}
    </div>
  );
};
