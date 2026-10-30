import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import { ErrorMessage } from './ErrorMessage';
import { Button } from '../ui/Button';
import { Mail, ArrowRight, Sparkles, KeyRound } from 'lucide-react';

interface AlternatePortal {
  label: string;
  href: string;
}

interface LoginFormProps {
  expectedRole: UserRole;
  roleLabel: string;
  submitButtonLabel: string;
  defaultEmailPlaceholder: string;
  onSuccessRedirect: string;
  alternatePortals: AlternatePortal[];
  demoCredentialHint?: {
    email: string;
    description: string;
  };
}

export const LoginForm: React.FC<LoginFormProps> = ({
  expectedRole,
  roleLabel,
  submitButtonLabel,
  defaultEmailPlaceholder,
  onSuccessRedirect,
  alternatePortals,
  demoCredentialHint,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your institutional email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login({
        email: email.trim(),
        password,
        expectedRole,
      });

      success(`Welcome back, ${res.full_name}`);
      navigate(onSuccessRedirect, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    if (demoCredentialHint) {
      setEmail(demoCredentialHint.email);
      // Demo password matching seed/mock convention
      if (expectedRole === 'admin') setPassword('NmamitDemo#2026');
      else if (expectedRole === 'mentor') setPassword('NmamitMentor#2026');
      else setPassword('NmamitMentee#2026');
      setErrorMsg(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Demo Credentials Helper Pill */}
      {demoCredentialHint && (
        <div className="p-3 rounded-xl bg-[#211A2D] border border-[#30263E] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#AAA2B8]">
            <KeyRound className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            <span className="truncate max-w-[200px]" title={demoCredentialHint.description}>
              {demoCredentialHint.description}
            </span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition underline underline-offset-2 flex-shrink-0"
          >
            Fill Demo
          </button>
        </div>
      )}

      <ErrorMessage message={errorMsg} />

      <FormField label={`${roleLabel} Email`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777084]">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={defaultEmailPlaceholder}
            disabled={isLoading}
            autoComplete="email"
            className="w-full pl-10 pr-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-150 disabled:opacity-40"
          />
        </div>
      </FormField>

      <FormField
        label="Password"
        rightLabel={
          <Link
            to="/forgot-password"
            className="text-[11px] text-violet-400 hover:text-violet-300 font-medium transition"
          >
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          disabled={isLoading}
          autoComplete="current-password"
        />
      </FormField>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-[#30263E] bg-[#12101A] text-violet-600 focus:ring-violet-500/40 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
          />
          <span className="text-xs text-[#AAA2B8]">Remember active session</span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        className="w-full mt-2 font-semibold"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        {submitButtonLabel}
      </Button>

      {/* Alternative Portals */}
      {alternatePortals.length > 0 && (
        <div className="pt-4 border-t border-[#30263E]/60 text-center">
          <p className="text-[11px] text-[#777084] mb-2">Looking for a different portal?</p>
          <div className="flex items-center justify-center gap-3 text-xs">
            {alternatePortals.map((portal, idx) => (
              <React.Fragment key={portal.href}>
                <Link
                  to={portal.href}
                  className="text-violet-400 hover:text-violet-300 font-medium transition"
                >
                  {portal.label}
                </Link>
                {idx < alternatePortals.length - 1 && (
                  <span className="text-[#30263E]">&bull;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};
