import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackPath,
}) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="Verifying role authorizations..." fullScreen />;
  }

  if (!profile) {
    // Redirect to the appropriate role login page if known, or universal login
    const targetLogin = location.pathname.startsWith('/admin')
      ? '/admin/login'
      : location.pathname.startsWith('/mentor')
      ? '/mentor/login'
      : location.pathname.startsWith('/mentee')
      ? '/mentee/login'
      : '/login';

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (!profile.is_active) {
    return (
      <Navigate
        to="/login"
        state={{ error: 'Your account has been deactivated by administration.' }}
        replace
      />
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  return children;
};

