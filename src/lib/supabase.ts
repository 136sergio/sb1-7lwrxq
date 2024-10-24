import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add error handling for common Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('JWT expired')) {
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