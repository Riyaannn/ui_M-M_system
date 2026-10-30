import React from 'react';

interface ProfileAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-tr from-violet-700 via-purple-600 to-indigo-500 text-white font-semibold flex items-center justify-center border border-violet-400/20 shadow-xs select-none flex-shrink-0 ${sizeStyles[size]} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

