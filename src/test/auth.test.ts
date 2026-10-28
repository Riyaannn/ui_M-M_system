import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import { dbStore } from '../services/dbStore';
import { INITIAL_ADMIN_ID, INITIAL_MENTOR_ID } from '../lib/mockData';

describe('Authentication and Session Tests', () => {
  beforeEach(() => {
    dbStore.resetToDefault();
  });

  it('Allows login for Administrator', async () => {
    const res = await authService.login('admin@nmamit.nitte.edu', 'NmamitDemo#2026');
    expect(res.profile).toBeDefined();
    expect(res.profile.role).toBe('admin');
    expect(res.profile.full_name).toBe('System Administrator');
  });

  it('Allows login for Mentor Anusha', async () => {
    const res = await authService.login('anusha.mentor@nmamit.nitte.edu', 'NmamitMentor#2026');
    expect(res.profile).toBeDefined();
    expect(res.profile.role).toBe('mentor');
    expect(res.profile.full_name).toBe('Anusha');
  });

  it('Allows login for Initial Mentee (Riya Ann)', async () => {
    const res = await authService.login('riya.ann.demo@nmamit.nitte.edu', 'NmamitMentee#2026');
    expect(res.profile).toBeDefined();
    expect(res.profile.role).toBe('mentee');
    expect(res.profile.full_name).toBe('Riya Ann');
    expect(res.profile.mentor_id).toBe(INITIAL_MENTOR_ID);
  });

  it('Rejects invalid email credentials', async () => {
    await expect(authService.login('unknown.student@nmamit.nitte.edu')).rejects.toThrow(
      /Invalid email address/
    );
  });

  it('Blocks login for deactivated accounts', async () => {
    const mentee = dbStore.getAllMentees()[0];
    dbStore.updateProfile(mentee.id, { is_active: false });

    await expect(authService.login(mentee.email)).rejects.toThrow(
      /account has been deactivated/
    );
  });
});
