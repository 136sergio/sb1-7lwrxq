import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface BackButtonProps {
  showConfirmation?: boolean;
  customPath?: string;
  hasChanges?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ showConfirmation = false, customPath, hasChanges = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDefaultPath = () => {
    if (customPath) return customPath;

    if (location.pathname.includes('/add-recipe') || location.pathname.includes('/edit-recipe')) {
      return '/recipes';
    }
    if (location.pathname.includes('/add-weekly-menu') || location.pathname.includes('/edit-weekly-menu')) {
      return '/menus';
    }
    if (location.pathname.startsWith('/admin/')) {
      return '/admin';
    }
    return '/';
  };

  const handleBack = () => {
    if (showConfirmation && hasChanges) {
      setIsModalOpen(true);
    } else {
      navigate(getDefaultPath());
    }
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate(getDefaultPath());
  };

  return (
    <>
      <button
        onClick={handleBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="mr-2" size={20} />
        Volver
      </button>
      {showConfirmation && hasChanges && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
          message="¿Estás seguro de que quieres salir sin guardar los cambios?"
        />
      )}
    </>
  );
};

export default BackButton;