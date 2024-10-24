import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalRecipes: number;
  totalMenus: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRecipes: 0,
    totalMenus: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get users count using the RPC function
        const { data: users, error: usersError } = await supabase.rpc('get_auth_users');
        if (usersError) throw usersError;
        
        // Get recipes count
        const { count: recipesCount, error: recipesError } = await supabase
          .from('recipes')
          .select('*', { count: 'exact', head: true });
        
        if (recipesError) throw recipesError;

        // Get menus count
        const { count: menusCount, error: menusError } = await supabase
          .from('weekly_menus')
          .select('*', { count: 'exact', head: true });
        
        if (menusError) throw menusError;

        setStats({
          totalUsers: users?.length || 0,
          totalRecipes: recipesCount || 0,
          totalMenus: menusCount || 0
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError(err instanceof Error ? err : new Error('Error al cargar las estadísticas'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}