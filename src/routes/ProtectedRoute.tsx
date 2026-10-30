import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactElement;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  redirectTo,
}) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="Authenticating session..." fullScreen />;
  }

  if (!profile) {
    // Intelligently redirect to role-specific login based on target path
    const loginPath = location.pathname.startsWith('/admin')
      ? '/admin/login'
      : location.pathname.startsWith('/mentor')
      ? '/mentor/login'
      : location.pathname.startsWith('/mentee')
      ? '/mentee/login'
      : (redirectTo || '/login');

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!profile.is_active) {
    return <Navigate to="/login" state={{ error: 'Your account has been deactivated.' }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  return children;
};
