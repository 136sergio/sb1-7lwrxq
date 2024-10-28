import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
          const parsed = JSON.parse(item);
          if (parsed.expires_at && new Date(parsed.expires_at) < new Date()) {
            localStorage.removeItem(key);
            return null;
          }
          return parsed;
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value)),
      removeItem: (key: string) => localStorage.removeItem(key)
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('JWT expired')) {
    setTimeout(async () => {
      try {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
      } catch {
        await supabase.auth.signOut();
      }
    }, 100);
    return new Error('Reconectando...');
  }
  if (error?.message?.includes('No API key found')) {
    return new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
  }
  if (error?.message?.includes('Failed to fetch')) {
    return new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
  }
  if (error?.code === 'PGRST301') {
    return new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
  }
  return error;
};

export const checkDatabaseConnection = async () => {
  return new Promise<boolean>((resolve) => {
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('recipes')
          .select('id')
          .limit(1)
          .single();

        if (error) throw error;
        resolve(true);
      } catch (error) {
        console.error('Database connection error:', error);
        resolve(false);
      }
    }, 100);
  });
};

export const clearSupabaseCache = async () => {
  return new Promise<void>((resolve) => {
    setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error } = await supabase.auth.refreshSession();
          if (error) throw error;
        }
        
        const keysToKeep = ['sb-session'];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        }
        
        sessionStorage.clear();
        
        const databases = await window.indexedDB.databases();
        databases.forEach(db => {
          if (db.name && !db.name.includes('session')) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
        
        resolve();
      } catch (error) {
        console.error('Error clearing cache:', error);
        resolve();
      }
    }, 100);
  });
};

export const refreshSession = async () => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        resolve(data.session);
      } catch (error) {
        console.error('Error refreshing session:', error);
        resolve(null);
      }
    }, 100);
  });
};