import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { UserProfile, AcademicRecord, MentorNote } from '../types';

export const mentorService = {
  /**
   * Retrieves only mentees strictly assigned to the given mentor
   */
  async getAssignedMentees(mentorId: string): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, mentor:mentor_id(*)')
          .eq('role', 'mentee')
          .eq('mentor_id', mentorId)
          .eq('is_active', true)
          .order('full_name', { ascending: true });
        if (error) throw error;
        return (data || []) as UserProfile[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getMenteesByMentorId(mentorId);
  },

  /**
   * Retrieves an individual mentee's dossier, strictly verifying that the mentee is assigned to this mentor
   */
  async getAssignedMenteeDetails(mentorId: string, menteeId: string): Promise<{
    mentee: UserProfile;
    records: AcademicRecord[];
    notes: MentorNote[];
    canViewAcademic: boolean;
    canViewContact: boolean;
  }> {
    const mentee = dbStore.getProfileById(menteeId);
    if (!mentee) {
      throw new Error('Mentee record not found.');
    }

    // Strict account isolation check: Mentor cannot view students not assigned to them!
    if (mentee.mentor_id !== mentorId) {
      throw new Error('Access denied: You are not authorized to view this student as they are not assigned to your mentoring cohort.');
    }

    const access = dbStore.getAccessSettings(menteeId);
    const canViewAcademic = access ? access.allow_academic_view : true;
    const canViewContact = access ? access.allow_contact_view : true;

    let records: AcademicRecord[] = [];
    if (canViewAcademic) {
      records = dbStore.getAcademicRecords(menteeId);
    }

    const notes = dbStore.getMentorNotes(mentorId, menteeId);

    return {
      mentee,
      records,
      notes,
      canViewAcademic,
      canViewContact,
    };
  },
};

