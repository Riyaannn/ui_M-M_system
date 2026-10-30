import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { FormField } from '../../components/auth/FormField';
import { ErrorMessage } from '../../components/auth/ErrorMessage';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await authService.resetPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B12] text-[#F5F3FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden mm-grid-pattern">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 group mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-violet-600/30 border border-violet-400/30 group-hover:scale-105 transition-transform">
            M&amp;M
          </div>
        </Link>
        <h2 className="text-xl font-bold text-[#F5F3FA]">Reset Account Password</h2>
        <p className="text-xs text-[#AAA2B8] mt-1">
          NMAMIT, Nitte &bull; M&amp;M Management System
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="border-[#30263E] bg-[#191521]/90 shadow-2xl backdrop-blur-md">
          <CardContent className="p-6 sm:p-8">
            {isSuccess ? (
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-2xl bg-[#4ADEA8]/15 border border-[#4ADEA8]/30 text-[#4ADEA8] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[#F5F3FA]">Recovery Instructions Sent</h3>
                <p className="text-xs text-[#AAA2B8] mt-2 mb-6 leading-relaxed">
                  If an account exists for <strong className="text-violet-300">{email}</strong>, a secure password recovery link has been dispatched to that address.
                </p>
                <Link to="/login">
                  <Button variant="primary" size="md" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-[#AAA2B8] leading-relaxed">
                  Enter your registered institutional email address. You will receive an email with instructions to securely reset your credentials.
                </p>

                <ErrorMessage message={errorMsg} />

                <FormField label="Institutional Email">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777084]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@nmamit.nitte.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-150"
                    />
                  </div>
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="w-full mt-2"
                >
                  Send Recovery Link
                </Button>

                <div className="pt-4 border-t border-[#30263E]/60 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-[#AAA2B8] hover:text-[#F5F3FA] transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Portal Directory</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
