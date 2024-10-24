import { useState, useEffect } from 'react';
import { adminService } from '../services/admin';

interface AdminMenu {
  id: string;
  name: string;
  user_id: string;
  user_email: string;
  created_at: string;
}

export function useAdminMenus() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllMenus();
        setMenus(data);
      } catch (err) {
        console.error('Error fetching admin menus:', err);
        setError(err instanceof Error ? err : new Error('Error al cargar los menús'));
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return { menus, loading, error };
}