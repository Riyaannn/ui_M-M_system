import React, { useState, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  className = '',
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777084]">
        <Lock className="w-4 h-4" />
      </div>

      <input
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        className={`w-full pl-10 pr-10 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...props}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777084] hover:text-[#AAA2B8] transition focus:outline-none"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
