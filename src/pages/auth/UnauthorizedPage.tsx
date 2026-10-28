import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const attemptedPath = location.state?.attemptedPath || 'the requested resource';

  const defaultHome = profile?.role === 'admin' 
    ? '/admin/dashboard' 
    : profile?.role === 'mentor' 
    ? '/mentor/dashboard' 
    : '/mentee/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mt-1">403 Forbidden</p>

        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          You do not possess the required privileges to view <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{attemptedPath}</span>.
        </p>

        <p className="text-xs text-slate-400 mt-2">
          Logged in as: <strong className="text-slate-700">{profile?.full_name}</strong> ({profile?.role})
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link to={defaultHome}>
            <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Return to Your Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Switch Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
