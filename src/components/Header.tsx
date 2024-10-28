import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Utensils, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login') {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <Link to="/" className="flex items-center">
            <Utensils className="h-8 w-8 text-green-500 mr-2" />
            <span className="text-xl font-semibold text-gray-800">PlanificaTuMenú</span>
          </Link>
          {user && (
            <nav className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-gray-600 text-center">{user.email}</span>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center text-gray-600 hover:text-green-500 transition-colors whitespace-nowrap"
                >
                  <Settings className="h-5 w-5 mr-1" />
                  <span className="text-sm">Admin</span>
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-red-500 transition-colors whitespace-nowrap"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;