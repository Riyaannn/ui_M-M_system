import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const { profile } = useAuth();

  const homePath = profile?.role === 'admin'
    ? '/admin/dashboard'
    : profile?.role === 'mentor'
    ? '/mentor/dashboard'
    : profile?.role === 'mentee'
    ? '/mentee/dashboard'
    : '/login';

  return (
    <div className="min-h-screen bg-[#0D0B12] text-[#F5F3FA] flex items-center justify-center p-4 relative mm-grid-pattern">
      <div className="max-w-md w-full bg-[#191521] rounded-2xl border border-[#30263E] p-8 shadow-2xl text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-[#211A2D] text-violet-400 border border-[#30263E] flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-[#F5F3FA] tracking-tight">Page Not Found</h1>
        <p className="text-xs font-semibold text-[#777084] uppercase tracking-wider mt-1">404 Error</p>

        <p className="text-sm text-[#AAA2B8] mt-3 leading-relaxed">
          The requested page could not be located in the M&amp;M mentoring platform.
        </p>

        <div className="mt-6 flex justify-center">
          <Link to={homePath}>
            <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
