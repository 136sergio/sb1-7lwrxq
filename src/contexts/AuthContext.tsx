import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase, clearSupabaseCache } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          console.log('Checking admin status for user:', userId);
          const { data, error } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error checking admin status:', error);
            resolve(false);
            return;
          }

          console.log('Admin status result:', !!data);
          resolve(!!data);
        } catch (error) {
          console.error('Error checking admin status:', error);
          resolve(false);
        }
      }, 100);
    });
  };

  const handleSession = async (session: Session | null) => {
    console.log('Handling session:', session?.user?.email);
    if (session?.user) {
      setUser(session.user);
      const adminStatus = await checkAdminStatus(session.user.id);
      setIsAdmin(adminStatus);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          await handleSession(session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event);
      setTimeout(async () => {
        switch (event) {
          case 'SIGNED_IN':
            await handleSession(session);
            break;
          case 'SIGNED_OUT':
            setUser(null);
            setIsAdmin(false);
            break;
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              const adminStatus = await checkAdminStatus(session.user.id);
              setIsAdmin(adminStatus);
            }
            break;
        }
        setLoading(false);
      }, 100);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return new Promise<{ error: AuthError | null }>(async (resolve) => {
      setTimeout(async () => {
        try {
          console.log('Starting sign in process for:', email);
          await clearSupabaseCache();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Sign in error:', error);
            throw error;
          }

          console.log('Sign in successful:', data.user?.email);
          if (data.user) {
            const adminStatus = await checkAdminStatus(data.user.id);
            setIsAdmin(adminStatus);
          }

          resolve({ error: null });
        } catch (error) {
          console.error('Sign in error:', error);
          resolve({ error: error as AuthError });
        }
      }, 100);
    });
  };

  const signUp = async (email: string, password: string) => {
    return new Promise<{ error: AuthError | null }>(async (resolve) => {
      setTimeout(async () => {
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/login`,
            },
          });
          resolve({ error });
        } catch (error) {
          console.error('Sign up error:', error);
          resolve({ error: error as AuthError });
        }
      }, 100);
    });
  };

  const signOut = async () => {
    return new Promise<void>(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          setLoading(true);
          await clearSupabaseCache();
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          setUser(null);
          setIsAdmin(false);
          resolve();
        } catch (error) {
          console.error('Error signing out:', error);
          reject(error);
        } finally {
          setLoading(false);
        }
      }, 100);
    });
  };

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}