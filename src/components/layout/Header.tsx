import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LogOut, Building2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 lg:px-6 py-3 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-nmam-navy-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
          <Building2 className="w-5 h-5 text-nmam-teal-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-900">NMAMIT</span>
            <span className="text-[11px] font-medium text-slate-400">Nitte</span>
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-nmam-navy-700">
              Mentor–Mentee Portal
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden md:block">
            NMAM Institute of Technology, Nitte (An Autonomous Institution)
          </p>
        </div>
      </div>

      {profile && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {profile.full_name}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {profile.email}
            </div>
          </div>
          <RoleBadge role={profile.role} />
          <Button
            size="sm"
            variant="ghost"
            onClick={logout}
            className="text-slate-500 hover:text-rose-600 p-2"
            title="Log out securely"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      )}
    </header>
  );
};
