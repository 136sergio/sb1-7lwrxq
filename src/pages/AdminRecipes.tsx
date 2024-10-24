import React from 'react';
import { BookOpen, Mail } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAdminRecipes } from '../hooks/useAdminRecipes';
import { useAdmin } from '../hooks/useAdmin';

const AdminRecipes: React.FC = () => {
  const { recipes, loading } = useAdminRecipes();
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Acceso denegado</h1>
        <p className="mt-2">No tienes permisos para acceder al panel de administración.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton customPath="/admin" />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Recetas Creadas</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Receta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Fecha Creación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                        <div className="text-sm font-medium text-gray-900 break-words">{recipe.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                        <div className="text-sm text-gray-500 break-words">{recipe.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(recipe.created_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecipes;