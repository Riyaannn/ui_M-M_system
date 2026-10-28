import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { UserProfile } from '../types';

export const authService = {
  async login(email: string, password?: string): Promise<{ profile: UserProfile }> {
    const trimmedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user returned from authentication');
      }

      // Fetch profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*, mentor:mentor_id(*)')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile) {
        throw new Error('User profile record not found');
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated. Please contact the NMAMIT administrator.');
      }

      return { profile: profile as UserProfile };
    }

    // Demo / offline mode authentication
    const allProfiles = dbStore.getProfiles();
    const matched = allProfiles.find(p => p.email.toLowerCase() === trimmedEmail);

    if (!matched) {
      throw new Error('Invalid email address. Please check your credentials or select a demonstration account below.');
    }

    if (!matched.is_active) {
      throw new Error('Your account has been deactivated. Please contact the administrator.');
    }

    return { profile: matched };
  },

  async resetPassword(email: string): Promise<void> {
    const trimmedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      return;
    }

    // Mock reset simulation
    const profile = dbStore.getProfiles().find(p => p.email.toLowerCase() === trimmedEmail);
    if (!profile) {
      throw new Error('No account found with this email address.');
    }
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error', e);
      }
    }
    localStorage.removeItem('nmamit_active_user');
  },
};
