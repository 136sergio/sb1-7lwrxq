import { useState, useEffect } from 'react';
import { adminService } from '../services/admin';

interface AdminRecipe {
  id: string;
  name: string;
  user_id: string;
  user_email: string;
  created_at: string;
}

export function useAdminRecipes() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllRecipes();
        setRecipes(data);
      } catch (err) {
        console.error('Error fetching admin recipes:', err);
        setError(err instanceof Error ? err : new Error('Error al cargar las recetas'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return { recipes, loading, error };
}