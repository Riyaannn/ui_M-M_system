import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  GraduationCap, 
  FileCheck2, 
  ShieldAlert, 
  History, 
  BookMarked, 
  StickyNote, 
  UserCircle2, 
  Award, 
  Compass, 
  X,
  Building
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const role = profile?.role;

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Manage Mentors', path: '/admin/mentors', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Manage Mentees', path: '/admin/mentees', icon: <Users className="w-4 h-4" /> },
    { label: 'Mentor Assignment', path: '/admin/assignments', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Marks Verification', path: '/admin/verifications', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'Access Permissions', path: '/admin/permissions', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <History className="w-4 h-4" /> },
  ];

  const mentorNav = [
    { label: 'Mentor Dashboard', path: '/mentor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Mentees', path: '/mentor/mentees', icon: <Users className="w-4 h-4" /> },
    { label: 'Recommendations', path: '/mentor/recommendations', icon: <BookMarked className="w-4 h-4" /> },
    { label: 'Private Notes', path: '/mentor/notes', icon: <StickyNote className="w-4 h-4" /> },
  ];

  const menteeNav = [
    { label: 'Mentee Dashboard', path: '/mentee/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Profile', path: '/mentee/profile', icon: <UserCircle2 className="w-4 h-4" /> },
    { label: 'Academic Records', path: '/mentee/academic-records', icon: <Award className="w-4 h-4" /> },
    { label: 'My Mentor', path: '/mentee/mentor', icon: <Compass className="w-4 h-4" /> },
    { label: 'Study Resources', path: '/mentee/recommendations', icon: <BookMarked className="w-4 h-4" /> },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'mentor' ? mentorNav : menteeNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-nmam-navy-950 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-nmam-teal-600 flex items-center justify-center text-white">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-nmam-teal-300">NMAMIT Nitte</div>
              <div className="text-[11px] text-slate-400 font-medium">Mentor–Mentee System</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
            {role === 'admin' ? 'Administration' : role === 'mentor' ? 'Mentoring Suite' : 'Mentee Portal'}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-nmam-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-nmam-navy-900 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Bottom institution info */}
        <div className="p-4 border-t border-slate-800/80 bg-nmam-navy-950/60 text-xs">
          <div className="text-slate-400 font-medium truncate">{profile?.full_name}</div>
          <div className="text-[11px] text-nmam-teal-400 capitalize">{role} Portal</div>
          <div className="text-[10px] text-slate-500 mt-2">
            Nitte Education Trust &bull; Autonomous
          </div>
        </div>
      </aside>
    </>
  );
};
