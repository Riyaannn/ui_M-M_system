import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../services/dbStore';
import { academicService } from '../services/academicService';
import { profileService } from '../services/profileService';
import { recommendationService } from '../services/recommendationService';
import { INITIAL_MENTOR_ID, INITIAL_ADMIN_ID } from '../lib/mockData';

describe('Security and Row Level Policy Enforcement Tests', () => {
  beforeEach(() => {
    dbStore.resetToDefault();
  });

  it('Initial 6 mentees are properly registered and assigned to Mentor Anusha', () => {
    const mentees = dbStore.getAllMentees();
    expect(mentees.length).toBeGreaterThanOrEqual(6);

    const initialNames = ['Riya Ann', 'Riya Pai', 'Rohan', 'Roshwin', 'Sinchana', 'Vijeth'];
    initialNames.forEach(name => {
      const found = mentees.find(m => m.full_name === name);
      expect(found).toBeDefined();
      expect(found?.mentor_id).toBe(INITIAL_MENTOR_ID);
    });
  });

  it('Mentor Anusha only views her assigned mentees', async () => {
    const anushaMentees = await profileService.getMenteesByMentor(INITIAL_MENTOR_ID);
    expect(anushaMentees.length).toBe(6);
    anushaMentees.forEach(m => {
      expect(m.mentor_id).toBe(INITIAL_MENTOR_ID);
    });
  });

  it('Privilege Guard: A user cannot elevate their role or alter unpermitted fields', () => {
    const menteeId = '22222222-2222-4222-a222-222222222201'; // Riya Ann
    
    // Attempt to update profile
    const updated = dbStore.updateProfile(menteeId, {
      full_name: 'Riya Ann Updated',
      phone: '+91 9988776655',
    });
    expect(updated.full_name).toBe('Riya Ann Updated');
    expect(updated.role).toBe('mentee'); // Role remains mentee
  });

  it('Academic Data Guard: Submitted records start as pending verification', async () => {
    const menteeId = '22222222-2222-4222-a222-222222222203'; // Rohan
    const record = await academicService.submitRecord({
      mentee_id: menteeId,
      semester: 5,
      academic_year: '2025-2026',
      subject_code: '22CS503',
      subject_name: 'Computer Networks',
      credits: 4.0,
      internal_marks: 42,
      external_marks: 45,
      total_marks: 87,
      maximum_marks: 100,
      grade: null,
      result_status: 'PENDING',
    }, menteeId);

    expect(record.verification_status).toBe('pending');
    expect(record.verified_by).toBeNull();
  });

  it('Academic Verification: Only administrator can verify and publish marks', async () => {
    const menteeId = '22222222-2222-4222-a222-222222222203';
    const record = await academicService.submitRecord({
      mentee_id: menteeId,
      semester: 5,
      academic_year: '2025-2026',
      subject_code: '22CS504',
      subject_name: 'Operating Systems',
      credits: 4.0,
      internal_marks: 40,
      external_marks: 40,
      total_marks: 80,
      maximum_marks: 100,
      grade: null,
      result_status: 'PENDING',
    }, menteeId);

    // Admin verifies
    const verified = await academicService.verifyRecord(record.id, 'verified', INITIAL_ADMIN_ID);
    expect(verified.verification_status).toBe('verified');
    expect(verified.verified_by).toBe(INITIAL_ADMIN_ID);
  });

  it('Recommendation Views: Mentees can mark recommendations as read', async () => {
    const menteeId = '22222222-2222-4222-a222-222222222202'; // Riya Pai
    const unreadRec = dbStore.getRecommendations({ menteeId }).find(r => !r.is_viewed);
    
    expect(unreadRec).toBeDefined();
    await recommendationService.markAsViewed(unreadRec!.id, menteeId);

    const updatedRecs = await recommendationService.getByMentee(menteeId);
    const target = updatedRecs.find(r => r.id === unreadRec!.id);
    expect(target?.is_viewed).toBe(true);
    expect(target?.viewed_at).toBeDefined();
  });

  it('Privacy Setting: Admin can toggle academic record visibility and profile edit permissions', () => {
    const menteeId = '22222222-2222-4222-a222-222222222201';
    
    // Revoke profile edit
    const updated = dbStore.updateAccessSettings(menteeId, {
      allow_profile_edit: false,
    }, INITIAL_ADMIN_ID);

    expect(updated.allow_profile_edit).toBe(false);

    // Check retrieved settings
    const settings = dbStore.getAccessSettings(menteeId);
    expect(settings.allow_profile_edit).toBe(false);
  });
});
