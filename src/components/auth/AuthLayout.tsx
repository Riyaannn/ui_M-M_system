import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeColor?: 'purple' | 'sky' | 'emerald' | 'teal';
  children: ReactNode;
  showBackToPortalChoice?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  badgeText,
  badgeColor = 'purple',
  children,
  showBackToPortalChoice = true,
}) => {
  const badgeStyles = {
    purple: 'bg-violet-500/15 text-[#C4B5FD] border-violet-500/30',
    sky: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-[#4ADEA8]/15 text-[#4ADEA8] border-[#4ADEA8]/30',
    teal: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  };

  return (
    <div className="min-h-screen bg-[#0D0B12] text-[#F5F3FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden mm-grid-pattern">
      {/* Subtle ambient violet glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* M&M Brand Mark */}
        <Link to="/login" className="inline-flex items-center gap-2 group mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-violet-600/25 border border-violet-400/30 group-hover:scale-105 transition-transform">
            M&amp;M
          </div>
        </Link>

        <div className="text-xs font-medium text-[#AAA2B8] tracking-wide">
          Mentoring, thoughtfully designed
        </div>

        {badgeText && (
          <div className="mt-4">
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyles[badgeColor]}`}
            >
              {badgeText}
            </span>
          </div>
        )}

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#F5F3FA] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#AAA2B8]">
          {subtitle}
        </p>
        <p className="text-[11px] text-[#777084] mt-1">
          NMAMIT, Nitte &bull; An Autonomous Institution
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="border-[#30263E] bg-[#191521]/90 shadow-2xl backdrop-blur-md">
          <CardContent className="p-6 sm:p-8">
            {children}
          </CardContent>
        </Card>

        {showBackToPortalChoice && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#AAA2B8] hover:text-[#F5F3FA] transition group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Choose a different portal</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
