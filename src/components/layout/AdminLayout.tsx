import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, NavItem } from './AppShell';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  UserCheck, 
  FileCheck2, 
  ShieldAlert, 
  History 
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Manage Mentors', path: '/admin/mentors', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Manage Mentees', path: '/admin/mentees', icon: <Users className="w-4 h-4" /> },
    { label: 'Mentor Assignment', path: '/admin/assignments', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Marks Verification', path: '/admin/verifications', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'Access Permissions', path: '/admin/permissions', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Security Audit Logs', path: '/admin/audit-logs', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <AppShell
      navItems={navItems}
      roleTitle="Administration Console"
      roleBadgeText="Admin"
      loginRedirect="/admin/login"
    >
      <Outlet />
    </AppShell>
  );
};
