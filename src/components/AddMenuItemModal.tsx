import React from 'react';
import { X, BookOpen, ShoppingCart } from 'lucide-react';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: () => void;
  onSelectProduct: () => void;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Añadir al menú</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              onClose();
              onSelectRecipe();
            }}
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="h-12 w-12 text-green-500 mb-3" />
            <span className="text-sm font-medium text-gray-900">Añadir Receta</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectProduct();
            }}
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-12 w-12 text-purple-500 mb-3" />
            <span className="text-sm font-medium text-gray-900">Añadir Producto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMenuItemModal;