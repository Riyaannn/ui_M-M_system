import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { dbStore } from '../../services/dbStore';
import { 
  LogOut, 
  Menu, 
  ArrowRightLeft, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen,
  Building2,
  Check
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { profile, logout, switchUser } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  const allProfiles = dbStore.getProfiles();
  const mentors = allProfiles.filter(p => p.role === 'mentor');
  const mentees = allProfiles.filter(p => p.role === 'mentee');
  const admins = allProfiles.filter(p => p.role === 'admin');

  const handleLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
    window.location.href = '/login';
  };

  const handleSwitch = async (userId: string) => {
    await switchUser(userId);
    setIsSwitchModalOpen(false);
    // Redirect to matching role dashboard
    const target = allProfiles.find(p => p.id === userId);
    if (target?.role === 'admin') window.location.href = '/admin/dashboard';
    else if (target?.role === 'mentor') window.location.href = '/mentor/dashboard';
    else if (target?.role === 'mentee') window.location.href = '/mentee/dashboard';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 lg:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

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
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo account switcher button */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowRightLeft className="w-4 h-4 text-nmam-teal-600" />}
            onClick={() => setIsSwitchModalOpen(true)}
            title="Switch demo persona for testing"
            className="text-xs border-slate-200 hover:border-nmam-teal-500"
          >
            <span className="hidden sm:inline">Role Switcher</span>
          </Button>

          {/* Current user badge & profile */}
          {profile && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
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
                onClick={() => setIsLogoutDialogOpen(true)}
                className="text-slate-500 hover:text-rose-600 p-2"
                title="Log out securely"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Switcher Modal */}
      <Modal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        title="Role & Demonstration Account Switcher"
        description="Select any account below to inspect the portal from Administrator, Mentor, or Mentee perspective."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Admins */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Administrator Accounts
            </div>
            <div className="space-y-1.5">
              {admins.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitch(u.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm transition ${
                    profile?.id === u.id
                      ? 'border-purple-500 bg-purple-50/50 text-purple-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{u.full_name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </div>
                  {profile?.id === u.id && <Check className="w-4 h-4 text-purple-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mentors */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
              Mentor (Anusha)
            </div>
            <div className="space-y-1.5">
              {mentors.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitch(u.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm transition ${
                    profile?.id === u.id
                      ? 'border-sky-500 bg-sky-50/50 text-sky-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{u.full_name} (Mentor)</div>
                    <div className="text-xs text-slate-500">{u.email} &bull; {u.department}</div>
                  </div>
                  {profile?.id === u.id && <Check className="w-4 h-4 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mentees */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Initial Mentees (Assigned to Anusha)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mentees.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitch(u.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-sm transition ${
                    profile?.id === u.id
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-medium text-slate-900 truncate">{u.full_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">Sem {u.semester || 5} &bull; Mentor: Anusha</div>
                  </div>
                  {profile?.id === u.id && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Secure Sign Out"
        message="Are you sure you want to end your authenticated session on the NMAMIT Mentor–Mentee portal?"
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="primary"
      />
    </>
  );
};
