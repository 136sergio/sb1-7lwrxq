import { useState, useEffect } from 'react';
import { adminService } from '../services/admin';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  recipes_count: number;
  menus_count: number;
  is_admin: boolean;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      if (!isAdmin) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar los usuarios'));
      if (err instanceof Error && err.message === 'not_admin') {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin, navigate]);

  const toggleAdminStatus = async (userId: string, makeAdmin: boolean) => {
    try {
      if (!isAdmin) {
        navigate('/');
        return;
      }
      
      await adminService.updateUserAdminStatus(userId, makeAdmin);
      await fetchUsers();
    } catch (err) {
      console.error('Error updating admin status:', err);
      if (err instanceof Error && err.message === 'not_admin') {
        navigate('/');
      }
      throw err;
    }
  };

  return { users, loading, error, toggleAdminStatus };
}