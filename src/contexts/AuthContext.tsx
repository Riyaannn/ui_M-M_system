import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { dbStore } from '../services/dbStore';
import { INITIAL_ADMIN_ID } from '../lib/mockData';

interface AuthContextType {
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_STORAGE_KEY = 'nmamit_active_user_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const p = await profileService.getProfile(data.session.user.id);
            if (p && p.is_active) {
              setProfile(p);
              setLoading(false);
              return;
            }
          }
        }

        // Demo / local session fallback
        const savedUserId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
        if (savedUserId) {
          const localProfile = dbStore.getProfileById(savedUserId);
          if (localProfile && localProfile.is_active) {
            setProfile(localProfile);
            setLoading(false);
            return;
          }
        }

        // Default initial session: NMAMIT Admin so user lands on full system overview
        const defaultAdmin = dbStore.getProfileById(INITIAL_ADMIN_ID);
        if (defaultAdmin) {
          setProfile(defaultAdmin);
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, defaultAdmin.id);
        }
      } catch (err: any) {
        console.error('Error during auth initialization:', err);
        setError(err.message || 'Failed to initialize session');
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state change if configured
    if (isSupabaseConfigured) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const p = await profileService.getProfile(session.user.id);
          if (p && p.is_active) {
            setProfile(p);
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { profile: loggedInProfile } = await authService.login(email, password);
      setProfile(loggedInProfile);
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, loggedInProfile.id);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setProfile(null);
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchUser = async (userId: string) => {
    setLoading(true);
    try {
      const targetProfile = dbStore.getProfileById(userId);
      if (!targetProfile) throw new Error('User not found');
      setProfile(targetProfile);
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, targetProfile.id);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!profile) return;
    const refreshed = await profileService.getProfile(profile.id);
    if (refreshed) {
      setProfile(refreshed);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        role: profile?.role || null,
        loading,
        error,
        login,
        logout,
        switchUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
