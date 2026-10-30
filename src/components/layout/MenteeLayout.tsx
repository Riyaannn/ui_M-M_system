import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, NavItem } from './AppShell';
import { 
  LayoutDashboard, 
  UserCircle2, 
  Award, 
  Compass, 
  BookMarked 
} from 'lucide-react';

export const MenteeLayout: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Mentee Dashboard', path: '/mentee/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Profile', path: '/mentee/profile', icon: <UserCircle2 className="w-4 h-4" /> },
    { label: 'Examination Records', path: '/mentee/academic-records', icon: <Award className="w-4 h-4" /> },
    { label: 'My Mentor', path: '/mentee/mentor', icon: <Compass className="w-4 h-4" /> },
    { label: 'Study Resources', path: '/mentee/recommendations', icon: <BookMarked className="w-4 h-4" /> },
  ];

  return (
    <AppShell
      navItems={navItems}
      roleTitle="Student Mentoring Space"
      roleBadgeText="Mentee"
      loginRedirect="/mentee/login"
    >
      <Outlet />
    </AppShell>
  );
};
