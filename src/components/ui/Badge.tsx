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
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  const variantStyles = {
    default: 'bg-[#211A2D] text-[#AAA2B8] border-[#30263E]',
    success: 'bg-[#4ADEA8]/10 text-[#4ADEA8] border-[#4ADEA8]/30 font-medium',
    warning: 'bg-[#FBBF74]/10 text-[#FBBF74] border-[#FBBF74]/30 font-medium',
    danger: 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/30 font-medium',
    info: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-medium',
    purple: 'bg-violet-500/15 text-[#C4B5FD] border-violet-500/30 font-medium',
    outline: 'border border-[#30263E] text-[#AAA2B8] bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  if (role === 'admin') {
    return (
      <Badge variant="purple" size="sm" className="shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
        Administrator
      </Badge>
    );
  }
  if (role === 'mentor') {
    return (
      <Badge variant="info" size="sm" className="shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        Mentor
      </Badge>
    );
  }
  return (
    <Badge variant="default" size="sm" className="shadow-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-[#AAA2B8]"></span>
      Mentee
    </Badge>
  );
};

export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <Badge variant="success" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADEA8]"></span>
        Verified
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge variant="danger" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]"></span>
        Rejected
      </Badge>
    );
  }
  return (
    <Badge variant="warning" size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF74]"></span>
      Pending Verification
    </Badge>
  );
};

export const ResultBadge: React.FC<{ status: ResultStatus }> = ({ status }) => {
  if (status === 'PASS') {
    return <Badge variant="success" size="sm">Pass</Badge>;
  }
  if (status === 'FAIL') {
    return <Badge variant="danger" size="sm">Fail</Badge>;
  }
  if (status === 'WITHHELD') {
    return <Badge variant="warning" size="sm">Withheld</Badge>;
  }
  return <Badge variant="default" size="sm">Pending</Badge>;
};
