import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    multiTab: true,
    storageKey: 'sb-session',
    storage: {
      getItem: (key) => {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
          const parsed = JSON.parse(item);
          // Verificar si la sesión ha expirado
          if (parsed.expires_at && new Date(parsed.expires_at) < new Date()) {
            localStorage.removeItem(key);
            return null;
          }
          return parsed;
        } catch {
          return null;
        }
      },
      setItem: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
      removeItem: (key) => localStorage.removeItem(key)
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

// Add error handling for common Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('JWT expired')) {
    // Instead of forcing sign out, try to refresh the token
    supabase.auth.refreshSession().catch(() => {
      supabase.auth.signOut(); // Only sign out if refresh fails
    });
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

// Function to check if the database is accessible
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('count')
      .limit(1)
      .single();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Function to clear supabase cache for current device only
export const clearSupabaseCache = async () => {
  try {
    const currentSession = await supabase.auth.getSession();
    if (currentSession.data.session) {
      await supabase.auth.refreshSession();
    }
    
    // Solo limpiar el almacenamiento local del dispositivo actual
    const keysToKeep = ['sb-session'];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    }
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Limpiar IndexedDB solo si es necesario
    const databases = await window.indexedDB.databases();
    for (const db of databases) {
      if (db.name && !db.name.includes('session')) {
        window.indexedDB.deleteDatabase(db.name);
      }
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Function to handle session refresh
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
};