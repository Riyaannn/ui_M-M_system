import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export const MentorLoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="NMAMIT Mentor Portal"
      subtitle="Academic mentorship portal for faculty mentors"
      badgeText="Faculty Access"
      badgeColor="sky"
    >
      <LoginForm
        expectedRole="mentor"
        roleLabel="Faculty Mentor"
        submitButtonLabel="Sign In as Mentor"
        defaultEmailPlaceholder="anusha.mentor@nmamit.nitte.edu"
        onSuccessRedirect="/mentor/dashboard"
        demoCredentialHint={{
          email: 'anusha.mentor@nmamit.nitte.edu',
          description: 'Mentor Anusha (Dept. of Computer Science)',
        }}
        alternatePortals={[
          { label: 'Administrator Login', href: '/admin/login' },
          { label: 'Student Mentee Login', href: '/mentee/login' },
        ]}
      />
    </AuthLayout>
  );
};

