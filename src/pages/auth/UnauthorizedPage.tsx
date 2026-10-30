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
    <div className="min-h-screen bg-[#0D0B12] text-[#F5F3FA] flex items-center justify-center p-4 relative mm-grid-pattern">
      <div className="max-w-md w-full bg-[#191521] rounded-2xl border border-[#30263E] p-8 shadow-2xl text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-[#F5F3FA] tracking-tight">Access Restricted</h1>
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mt-1">403 Forbidden</p>

        <p className="text-sm text-[#AAA2B8] mt-3 leading-relaxed">
          You do not possess the required privileges to view <span className="font-mono text-xs bg-[#12101A] px-2 py-0.5 rounded-lg border border-[#30263E] text-violet-300">{attemptedPath}</span>.
        </p>

        {profile && (
          <p className="text-xs text-[#777084] mt-2">
            Active identity: <strong className="text-[#F5F3FA]">{profile.full_name}</strong> ({profile.role})
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link to={defaultHome}>
            <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Your Workspace
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Switch Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
