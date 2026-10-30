import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * @deprecated Legacy generic dashboard layout.
 * Use role-specific layouts: AdminLayout, MentorLayout, or MenteeLayout.
 */
export const DashboardLayout: React.FC = () => {
  return <Outlet />;
};
