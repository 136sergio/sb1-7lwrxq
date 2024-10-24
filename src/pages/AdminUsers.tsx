import React, { useState } from 'react';
import { Mail, Calendar, BookOpen, CalendarRange, Shield, ShieldOff, UserPlus } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import CreateUserModal from '../components/CreateUserModal';

const AdminUsers: React.FC = () => {
  const { users, loading, error, toggleAdminStatus } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    makeAdmin: boolean;
  }>({
    isOpen: false,
    userId: '',
    makeAdmin: false
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton customPath="/admin" />
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error al cargar los usuarios: {error.message}</p>
        </div>
      </div>
    );
  }

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setConfirmModal({
      isOpen: true,
      userId,
      makeAdmin
    });
  };

  const handleConfirmToggleAdmin = async () => {
    try {
      await toggleAdminStatus(confirmModal.userId, confirmModal.makeAdmin);
      setConfirmModal({ isOpen: false, userId: '', makeAdmin: false });
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton customPath="/admin" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Crear Usuario
        </button>
      </div>

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
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Recetas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Menús
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {user.email}
                          {user.is_admin && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                        <div className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                        <div className="text-sm text-gray-900">{user.recipes_count}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarRange className="h-5 w-5 text-purple-500 flex-shrink-0 mr-2" />
                        <div className="text-sm text-gray-900">{user.menus_count}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleAdmin(user.id, !user.is_admin)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            user.is_admin
                              ? 'text-red-700 bg-red-100 hover:bg-red-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {user.is_admin ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-1" />
                              <span className="whitespace-nowrap">Quitar admin</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-1" />
                              <span className="whitespace-nowrap">Hacer admin</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: '', makeAdmin: false })}
        onConfirm={handleConfirmToggleAdmin}
        message={`¿Estás seguro de que quieres ${
          confirmModal.makeAdmin ? 'hacer administrador' : 'quitar los permisos de administrador a'
        } este usuario?`}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default AdminUsers;