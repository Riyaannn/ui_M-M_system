import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { UserProfile } from '../types';

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, mentor:mentor_id(*)')
          .eq('id', userId)
          .single();
        if (error) throw error;
        return data as UserProfile;
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getProfileById(userId);
  },

  async getAllMentees(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, mentor:mentor_id(*)')
          .eq('role', 'mentee')
          .order('full_name', { ascending: true });
        if (error) throw error;
        return data as UserProfile[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getAllMentees();
  },

  async getAllMentors(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mentor')
          .order('full_name', { ascending: true });
        if (error) throw error;
        return data as UserProfile[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getAllMentors();
  },

  async getMenteesByMentor(mentorId: string): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, mentor:mentor_id(*)')
          .eq('role', 'mentee')
          .eq('mentor_id', mentorId)
          .order('full_name', { ascending: true });
        if (error) throw error;
        return data as UserProfile[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getMenteesByMentorId(mentorId);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>, actorId?: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select('*, mentor:mentor_id(*)')
          .single();
        if (error) throw error;
        dbStore.logAction(actorId || userId, 'PROFILE_UPDATED', 'PROFILE', userId, updates);
        return data as UserProfile;
      } catch (e) {
        console.warn('Supabase update failed, falling back to local store', e);
      }
    }
    const updated = dbStore.updateProfile(userId, updates);
    dbStore.logAction(actorId || userId, 'PROFILE_UPDATED', 'PROFILE', userId, updates);
    return updated;
  },

  async assignMentee(menteeId: string, mentorId: string | null, actorId?: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ mentor_id: mentorId })
          .eq('id', menteeId)
          .select('*, mentor:mentor_id(*)')
          .single();
        if (error) throw error;

        // update access_settings too
        await supabase
          .from('access_settings')
          .upsert({
            mentee_id: menteeId,
            mentor_id: mentorId,
            updated_by: actorId || null,
          });

        dbStore.logAction(actorId || 'system', 'MENTOR_ASSIGNED', 'PROFILE', menteeId, {
          mentor_id: mentorId,
        });
        return data as UserProfile;
      } catch (e) {
        console.warn('Supabase assign failed, falling back to local store', e);
      }
    }

    const assigned = dbStore.assignMenteeToMentor(menteeId, mentorId);
    dbStore.logAction(actorId || 'system', 'MENTOR_ASSIGNED', 'PROFILE', menteeId, {
      mentor_id: mentorId,
    });
    return assigned;
  },

  async toggleActiveStatus(userId: string, isActive: boolean, actorId?: string): Promise<UserProfile> {
    return this.updateProfile(userId, { is_active: isActive }, actorId);
  },
};
