import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { UserProfile, UserRole } from '../types';

export interface LoginParams {
  email: string;
  password?: string;
  expectedRole?: UserRole;
  rememberMe?: boolean;
}

export const authService = {
  /**
   * Secure email/password login enforcing backend role verification
   */
  async login({ email, password, expectedRole }: LoginParams): Promise<{ profile: UserProfile }> {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      throw new Error('Please enter a valid email address.');
    }

    if (isSupabaseConfigured && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) {
        // Safe, generic credential error to avoid email enumeration
        throw new Error('Invalid email or password. Please verify your credentials.');
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user identity returned.');
      }

      // Fetch trusted profile from backend
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*, mentor:mentor_id(*)')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile) {
        await supabase.auth.signOut();
        throw new Error('User profile record not found. Please contact administration.');
      }

      // Check account activation
      if (!profile.is_active) {
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated. Please contact the NMAMIT administrator.');
      }

      // Strict role isolation: if a specific role portal was used, verify role matches
      if (expectedRole && profile.role !== expectedRole) {
        await supabase.auth.signOut();
        const roleTitles: Record<UserRole, string> = {
          admin: 'System Administrators',
          mentor: 'Faculty Mentors',
          mentee: 'Undergraduate Students',
        };
        throw new Error(
          `Access restricted: This portal is reserved exclusively for ${roleTitles[expectedRole]}. Please use your designated login portal.`
        );
      }

      return { profile: profile as UserProfile };
    }

    // Local / Offline / Mock demonstration fallback
    const allProfiles = dbStore.getProfiles();
    const matched = allProfiles.find(p => p.email.toLowerCase() === trimmedEmail);

    if (!matched) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    if (!matched.is_active) {
      throw new Error('Your account has been deactivated. Please contact the administrator.');
    }

    // Role check in offline mode
    if (expectedRole && matched.role !== expectedRole) {
      const roleTitles: Record<UserRole, string> = {
        admin: 'System Administrators',
        mentor: 'Faculty Mentors',
        mentee: 'Undergraduate Students',
      };
      throw new Error(
        `Access restricted: This portal is reserved exclusively for ${roleTitles[expectedRole]}. Please use your designated login portal.`
      );
    }

    return { profile: matched };
  },

  /**
   * Password reset dispatch
   */
  async resetPassword(email: string): Promise<void> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new Error('Please enter your registered email address.');
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        // Return generic success to avoid email harvesting
        console.warn('Supabase resetPassword error:', error.message);
      }
      return;
    }

    // Local simulation: verify profile exists or silently succeed
    const profile = dbStore.getProfiles().find(p => p.email.toLowerCase() === trimmedEmail);
    if (!profile) {
      // Do not reveal email absence
      return;
    }
  },

  /**
   * Secure sign out and cleanup
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    localStorage.removeItem('nmamit_active_user_id');
  },
};
