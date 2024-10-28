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
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Add error handling for common Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('JWT expired')) {
    supabase.auth.signOut(); // Force sign out on expired token
    return new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
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

// Function to clear supabase cache
export const clearSupabaseCache = async () => {
  try {
    await supabase.auth.refreshSession();
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    
    // Clear all data from IndexedDB
    const databases = await window.indexedDB.databases();
    databases.forEach(db => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};