import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { UserProfile, AcademicRecord, Recommendation } from '../types';

export const menteeService = {
  /**
   * Retrieves a mentee's personal profile
   */
  async getStudentProfile(menteeId: string): Promise<UserProfile | null> {
    return dbStore.getProfileById(menteeId);
  },

  /**
   * Retrieves the mentee's assigned mentor details
   */
  async getAssignedMentor(mentorId: string): Promise<UserProfile | null> {
    const mentor = dbStore.getProfileById(mentorId);
    if (!mentor || mentor.role !== 'mentor') return null;
    return mentor;
  },

  /**
   * Retrieves examination records for this mentee only
   */
  async getMyRecords(menteeId: string): Promise<AcademicRecord[]> {
    return dbStore.getAcademicRecords(menteeId);
  },

  /**
   * Submits a draft academic record for administrative verification
   */
  async submitDraftRecord(
    menteeId: string,
    recordData: {
      semester: number;
      academic_year: string;
      subject_code: string;
      subject_name: string;
      credits: number;
      internal_marks?: number | null;
      external_marks?: number | null;
      maximum_marks: number;
    }
  ): Promise<AcademicRecord> {
    const record = dbStore.createAcademicRecord({
      ...recordData,
      mentee_id: menteeId,
      submitted_by: menteeId,
      verification_status: 'pending',
      result_status: 'PENDING',
    });

    dbStore.logAction(menteeId, 'MARKS_SUBMITTED_BY_STUDENT', 'ACADEMIC_RECORD', record.id, {
      subject_code: recordData.subject_code,
      semester: recordData.semester,
    });

    return record;
  },

  /**
   * Retrieves study recommendations addressed to this mentee
   */
  async getMyRecommendations(menteeId: string): Promise<Recommendation[]> {
    return dbStore.getRecommendations({ menteeId });
  },

  /**
   * Marks a study recommendation as read by this mentee
   */
  async markRecommendationRead(recommendationId: string, menteeId: string): Promise<void> {
    dbStore.markRecommendationViewed(recommendationId, menteeId);
  },
};

