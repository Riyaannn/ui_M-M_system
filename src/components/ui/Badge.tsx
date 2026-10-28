import React from 'react';
import { UserRole, VerificationStatus, ResultStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    info: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 font-medium',
    outline: 'border border-slate-200 text-slate-600 bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  if (role === 'admin') {
    return <Badge variant="purple" size="sm">Administrator</Badge>;
  }
  if (role === 'mentor') {
    return <Badge variant="info" size="sm">Mentor</Badge>;
  }
  return <Badge variant="default" size="sm">Mentee</Badge>;
};

export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'verified') {
    return <Badge variant="success" size="sm">Verified</Badge>;
  }
  if (status === 'rejected') {
    return <Badge variant="danger" size="sm">Rejected</Badge>;
  }
  return <Badge variant="warning" size="sm">Pending Verification</Badge>;
};

export const ResultBadge: React.FC<{ status: ResultStatus }> = ({ status }) => {
  if (status === 'PASS') {
    return <Badge variant="success" size="sm">PASS</Badge>;
  }
  if (status === 'FAIL') {
    return <Badge variant="danger" size="sm">FAIL</Badge>;
  }
  return <Badge variant="warning" size="sm">PENDING</Badge>;
};
