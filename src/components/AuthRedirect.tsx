import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      setTimeout(() => {
        if (event === 'SIGNED_OUT') {
          // Only redirect to login if we're not already there
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }
        // Remove automatic navigation on SIGNED_IN to let LoginForm handle it
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return null;
}