import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import { dbStore } from '../services/dbStore';
import { INITIAL_MENTOR_ID, INITIAL_ADMIN_ID } from '../lib/mockData';

describe('Role-Based Authentication and Account Isolation Tests', () => {
  beforeEach(() => {
    dbStore.resetToDefault();
  });

  it('1. Administrator can log in through /admin/login with expectedRole = admin', async () => {
    const res = await authService.login({
      email: 'admin@nmamit.nitte.edu',
      password: 'NmamitDemo#2026',
      expectedRole: 'admin',
    });
    expect(res.profile).toBeDefined();
    expect(res.profile.role).toBe('admin');
    expect(res.profile.full_name).toBe('System Administrator');
  });

  it('2. Mentor can log in through /mentor/login with expectedRole = mentor', async () => {
    const res = await authService.login({
      email: 'anusha.mentor@nmamit.nitte.edu',
      password: 'NmamitMentor#2026',
      expectedRole: 'mentor',
    });
    expect(res.profile).toBeDefined();
    expect(res.profile.role).toBe('mentor');
    expect(res.profile.full_name).toBe('Anusha');
  });

  it('3. Mentee can log in through /mentee/login with expectedRole = mentee', async () => {
    const res = await authService.login({
      email: 'riya.ann.demo@nmamit.nitte.edu',
      password: 'NmamitMentee#2026',
      expectedRole: 'mentee',
    });
    expect(res.profile).toBeDefined();
    expect(res.profile.role).toBe('mentee');
    expect(res.profile.full_name).toBe('Riya Ann');
    expect(res.profile.mentor_id).toBe(INITIAL_MENTOR_ID);
  });

  it('4. Role Isolation: Mentor credentials cannot grant Administrator access', async () => {
    await expect(
      authService.login({
        email: 'anusha.mentor@nmamit.nitte.edu',
        password: 'NmamitMentor#2026',
        expectedRole: 'admin', // attempting to log in as admin!
      })
    ).rejects.toThrow(/Access restricted/);
  });

  it('5. Role Isolation: Mentee credentials cannot grant Mentor access', async () => {
    await expect(
      authService.login({
        email: 'riya.ann.demo@nmamit.nitte.edu',
        password: 'NmamitMentee#2026',
        expectedRole: 'mentor', // attempting to log in as mentor!
      })
    ).rejects.toThrow(/Access restricted/);
  });

  it('6. Role Isolation: Mentee credentials cannot grant Administrator access', async () => {
    await expect(
      authService.login({
        email: 'riya.ann.demo@nmamit.nitte.edu',
        password: 'NmamitMentee#2026',
        expectedRole: 'admin', // attempting to log in as admin!
      })
    ).rejects.toThrow(/Access restricted/);
  });

  it('7. Rejects invalid credentials with generic error', async () => {
    await expect(
      authService.login({
        email: 'nonexistent@nmamit.nitte.edu',
        password: 'wrongPassword',
      })
    ).rejects.toThrow(/Invalid email or password/);
  });

  it('8. Blocks login for deactivated accounts', async () => {
    const mentee = dbStore.getAllMentees()[0];
    dbStore.updateProfile(mentee.id, { is_active: false }, INITIAL_ADMIN_ID);

    await expect(
      authService.login({
        email: mentee.email,
        password: 'anyPassword',
      })
    ).rejects.toThrow(/account has been deactivated/);
  });

  it('9. Logout clears the active session and prevents state leaks', async () => {
    await authService.logout();
    expect(localStorage.getItem('nmamit_active_user_id')).toBeNull();
  });
});
