import React from 'react';
import { Users, BookOpen, CalendarRange } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminStats } from '../hooks/useAdminStats';
import BackButton from '../components/BackButton';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { stats, loading, error } = useAdminStats();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error al cargar las estadísticas. Por favor, inténtalo de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <span className="text-3xl font-bold text-gray-800">
              {loading ? '-' : stats.totalUsers}
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Usuarios Registrados</h3>
        </Link>

        <Link to="/admin/recipes" className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-8 w-8 text-green-500" />
            <span className="text-3xl font-bold text-gray-800">
              {loading ? '-' : stats.totalRecipes}
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Recetas Creadas</h3>
        </Link>

        <Link to="/admin/menus" className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CalendarRange className="h-8 w-8 text-purple-500" />
            <span className="text-3xl font-bold text-gray-800">
              {loading ? '-' : stats.totalMenus}
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Menús Creados</h3>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;