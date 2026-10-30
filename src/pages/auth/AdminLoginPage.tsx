import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export const AdminLoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="NMAMIT Administration Portal"
      subtitle="Secure access for authorized system administrators"
      badgeText="Administrative Access"
      badgeColor="purple"
    >
      <LoginForm
        expectedRole="admin"
        roleLabel="Administrator"
        submitButtonLabel="Sign In to Administration"
        defaultEmailPlaceholder="admin@nmamit.nitte.edu"
        onSuccessRedirect="/admin/dashboard"
        demoCredentialHint={{
          email: 'admin@nmamit.nitte.edu',
          description: 'NMAMIT System Administrator',
        }}
        alternatePortals={[
          { label: 'Faculty Mentor Login', href: '/mentor/login' },
          { label: 'Student Mentee Login', href: '/mentee/login' },
        ]}
      />
    </AuthLayout>
  );
};

