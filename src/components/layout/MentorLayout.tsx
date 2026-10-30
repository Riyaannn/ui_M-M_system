import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, NavItem } from './AppShell';
import { 
  LayoutDashboard, 
  Users, 
  BookMarked, 
  StickyNote 
} from 'lucide-react';

export const MentorLayout: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Mentor Dashboard', path: '/mentor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Mentees', path: '/mentor/mentees', icon: <Users className="w-4 h-4" /> },
    { label: 'Study Recommendations', path: '/mentor/recommendations', icon: <BookMarked className="w-4 h-4" /> },
    { label: 'Private Counseling Notes', path: '/mentor/notes', icon: <StickyNote className="w-4 h-4" /> },
  ];

  return (
    <AppShell
      navItems={navItems}
      roleTitle="Faculty Mentoring Workspace"
      roleBadgeText="Mentor"
      loginRedirect="/mentor/login"
    >
      <Outlet />
    </AppShell>
  );
};
