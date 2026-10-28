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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">404 Error</p>

        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          The requested page could not be located on the NMAMIT Mentor–Mentee portal.
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
