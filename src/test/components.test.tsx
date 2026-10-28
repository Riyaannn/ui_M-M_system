import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RoleBadge, VerificationBadge, ResultBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Users } from 'lucide-react';

describe('UI Component Unit Tests', () => {
  it('Renders Role Badges with appropriate semantic labeling', () => {
    const { rerender } = render(<RoleBadge role="admin" />);
    expect(screen.getByText('Administrator')).toBeInTheDocument();

    rerender(<RoleBadge role="mentor" />);
    expect(screen.getByText('Mentor')).toBeInTheDocument();

    rerender(<RoleBadge role="mentee" />);
    expect(screen.getByText('Mentee')).toBeInTheDocument();
  });

  it('Renders Academic Verification Badges correctly', () => {
    const { rerender } = render(<VerificationBadge status="verified" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();

    rerender(<VerificationBadge status="pending" />);
    expect(screen.getByText('Pending Verification')).toBeInTheDocument();

    rerender(<VerificationBadge status="rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('Renders StatCard with proper title, values, and icon', () => {
    render(
      <StatCard
        title="Assigned Mentees"
        value={6}
        subtitle="Active students under Anusha"
        icon={<Users data-testid="users-icon" />}
        color="teal"
      />
    );

    expect(screen.getByText('Assigned Mentees')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Active students under Anusha')).toBeInTheDocument();
  });
});
