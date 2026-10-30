import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService, LoginParams } from '../services/authService';
import { profileService } from '../services/profileService';
import { dbStore } from '../services/dbStore';

interface AuthContextType {
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  login: (params: LoginParams) => Promise<UserProfile>;
  logout: () => Promise<void>;
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
      // Allow demo URL param for direct screenshot capture / automated inspection
      try {
        const params = new URLSearchParams(window.location.search);
        const demoUser = params.get('demo_user');
        if (demoUser === 'admin') {
          localStorage.setItem('nmamit_active_user_id', '00000000-0000-4000-a000-000000000001');
        } else if (demoUser === 'mentor') {
          localStorage.setItem('nmamit_active_user_id', '11111111-1111-4111-a111-111111111111');
        } else if (demoUser === 'mentee') {
          localStorage.setItem('nmamit_active_user_id', '22222222-2222-4222-a222-222222222201');
        } else if (demoUser === 'logout') {
          localStorage.removeItem('nmamit_active_user_id');
        }
      } catch (e) {
        // ignore in SSR/restricted environments
      }
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
            } else if (p && !p.is_active) {
              await supabase.auth.signOut();
              setProfile(null);
              setError('Account deactivated');
            }
          }
          setProfile(null);
          setLoading(false);
          return;
        }

        // Demo / local session fallback: restore active user if one was logged in
        const savedUserId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
        if (savedUserId) {
          const localProfile = dbStore.getProfileById(savedUserId);
          if (localProfile && localProfile.is_active) {
            setProfile(localProfile);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
          }
        }

        // Unauthenticated initial state
        setProfile(null);
      } catch (err: any) {
        console.error('Error during auth initialization:', err);
        setError(err.message || 'Failed to initialize session');
        setProfile(null);
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

  const login = async (params: LoginParams): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      const { profile: loggedInProfile } = await authService.login(params);
      setProfile(loggedInProfile);
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, loggedInProfile.id);
      return loggedInProfile;
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

  const refreshProfile = async () => {
    if (!profile) return;
    const refreshed = await profileService.getProfile(profile.id);
    if (refreshed && refreshed.is_active) {
      setProfile(refreshed);
    } else {
      await logout();
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

export const useRole = (): UserRole | null => {
  const { role } = useAuth();
  return role;
};

export const useCurrentProfile = (): UserProfile | null => {
  const { profile } = useAuth();
  return profile;
};
