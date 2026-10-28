import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="Authenticating session..." fullScreen />;
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile.is_active) {
    return <Navigate to="/login" state={{ error: 'Your account is deactivated' }} replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  return children;
};
