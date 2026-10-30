import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { RoleBadge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { 
  LogOut, 
  Menu, 
  X, 
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface AppShellProps {
  navItems: NavItem[];
  roleTitle: string;
  roleBadgeText: string;
  loginRedirect: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  navItems,
  roleTitle,
  roleBadgeText,
  loginRedirect,
  children,
}) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
    navigate(loginRedirect, { replace: true });
  };

  // Find active label for breadcrumb
  const currentNav = navItems.find(item => location.pathname === item.path) ||
    navItems.find(item => location.pathname.startsWith(item.path) && item.path !== '/admin' && item.path !== '/mentor' && item.path !== '/mentee');

  return (
    <div className="min-h-screen bg-[#0D0B12] text-[#F5F3FA] flex flex-col lg:flex-row antialiased selection:bg-[#6D28D9] selection:text-[#F5F3FA]">
      
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#100D17] border-r border-[#30263E] flex-shrink-0 z-30 sticky top-0 h-screen select-none">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-[#30263E]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-violet-600/25 border border-violet-400/30">
              M&amp;M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#F5F3FA]">M&amp;M</span>
                <span className="text-[10px] uppercase font-semibold text-violet-400 bg-violet-500/15 px-1.5 py-0.2 rounded border border-violet-500/30">
                  {roleBadgeText}
                </span>
              </div>
              <p className="text-[10px] text-[#777084] tracking-wide mt-0.5">
                Mentoring, thoughtfully designed
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Institutional Tag */}
        <div className="px-5 py-2.5 bg-[#12101A] border-b border-[#30263E]/40 flex items-center justify-between text-[11px] text-[#AAA2B8]">
          <span className="font-medium text-[#AAA2B8]">NMAMIT, Nitte</span>
          <span className="text-[10px] text-[#777084]">Autonomous</span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5" aria-label="Sidebar Navigation">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#777084]">
            Workspace
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-violet-600/20 text-[#F5F3FA] border border-violet-500/30 shadow-xs'
                    : 'text-[#AAA2B8] hover:text-[#F5F3FA] hover:bg-[#191521] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-violet-400' : 'text-[#777084] group-hover:text-[#AAA2B8]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge != null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-auto" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Current User Profile & Logout Bottom Area */}
        <div className="p-3 border-t border-[#30263E]/60 bg-[#12101A]/80">
          <div className="p-2.5 rounded-xl bg-[#191521] border border-[#30263E] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <ProfileAvatar name={profile?.full_name || 'User'} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F5F3FA] truncate">
                  {profile?.full_name || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-[#777084] truncate">
                  {profile?.email || 'user@nmamit.nitte.edu'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="p-1.5 text-[#AAA2B8] hover:text-[#FB7185] hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
              title="Sign Out"
              aria-label="Sign out of M&M"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Slim Topbar */}
        <header className="sticky top-0 z-20 bg-[#12101A]/90 backdrop-blur-md border-b border-[#30263E] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#AAA2B8] hover:text-[#F5F3FA] hover:bg-[#191521] border border-[#30263E] transition"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb Context */}
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="font-semibold text-violet-400">M&amp;M</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#777084]" />
              <span className="text-[#AAA2B8] hidden sm:inline">{roleTitle}</span>
              {currentNav && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-[#777084] hidden sm:inline" />
                  <span className="font-medium text-[#F5F3FA] truncate">{currentNav.label}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Header Area */}
          <div className="flex items-center gap-3">
            {profile && <RoleBadge role={profile.role} />}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#30263E]">
              <ProfileAvatar name={profile?.full_name || 'User'} size="sm" />
              <span className="text-xs font-semibold text-[#F5F3FA] hidden md:inline">
                {profile?.full_name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Main Content with Subtle Ambient Glow */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative">
          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#30263E]/60 py-4 px-6 text-center text-xs text-[#777084] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} M&amp;M &bull; NMAMIT, Nitte (Autonomous)</span>
          <span className="text-[11px] text-[#777084]">Mentor &amp; Mentee Management Architecture</span>
        </footer>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div
            className="w-72 bg-[#100D17] border-r border-[#30263E] h-full flex flex-col p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#30263E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-bold flex items-center justify-center text-sm">
                  M&amp;M
                </div>
                <span className="font-bold text-sm text-[#F5F3FA]">M&amp;M Portal</span>
              </div>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1.5 text-[#AAA2B8] hover:text-[#F5F3FA] rounded-lg hover:bg-[#191521]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-violet-600/20 text-[#F5F3FA] border border-violet-500/30'
                        : 'text-[#AAA2B8] hover:text-[#F5F3FA] hover:bg-[#191521]'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-[#30263E]">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  setIsLogoutDialogOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out of M&M"
        message="Are you sure you want to end your active session on this device?"
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="primary"
      />
    </div>
  );
};

