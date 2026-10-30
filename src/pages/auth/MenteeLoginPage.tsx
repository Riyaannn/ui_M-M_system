import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export const MenteeLoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="NMAMIT Student Portal"
      subtitle="Undergraduate student portal for NMAMIT mentees"
      badgeText="Student Access"
      badgeColor="emerald"
    >
      <LoginForm
        expectedRole="mentee"
        roleLabel="Student Mentee"
        submitButtonLabel="Sign In as Student"
        defaultEmailPlaceholder="riya.ann.demo@nmamit.nitte.edu"
        onSuccessRedirect="/mentee/dashboard"
        demoCredentialHint={{
          email: 'riya.ann.demo@nmamit.nitte.edu',
          description: 'Mentee Riya Ann (Assigned to Anusha)',
        }}
        alternatePortals={[
          { label: 'Administrator Login', href: '/admin/login' },
          { label: 'Faculty Mentor Login', href: '/mentor/login' },
        ]}
      />
    </AuthLayout>
  );
};

