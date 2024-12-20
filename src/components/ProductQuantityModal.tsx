import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface ProductQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  product: any;
}

const ProductQuantityModal: React.FC<ProductQuantityModalProps> = ({ isOpen, onClose, onConfirm, product }) => {
  const [quantity, setQuantity] = useState('100');

  if (!isOpen || !product) return null;

  const determineUnit = (product: any): string => {
    const lowerName = product.name.toLowerCase();
    const lowerQuantity = String(product.quantity || '').toLowerCase();
    
    if (
      lowerName.includes('ml') || 
      lowerName.includes('l') ||
      lowerQuantity.includes('ml') ||
      lowerQuantity.includes('l') ||
      lowerName.includes('leche') ||
      lowerName.includes('bebida') ||
      lowerName.includes('zumo') ||
      lowerName.includes('aceite')
    ) {
      return 'ml';
    }
    return 'g';
  };

  const handleSubmit = () => {
    const parsedQuantity = parseFloat(quantity);
    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
      onConfirm(parsedQuantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[70]">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Cantidad del producto</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-16 h-16 object-contain flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              {product.brand && (
                <p className="text-sm text-gray-500">{product.brand}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Cantidad
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                min="0.1"
                step="0.1"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Medida
              </label>
              <input
                type="text"
                value={determineUnit(product)}
                disabled
                className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!quantity || parseFloat(quantity) <= 0}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir producto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductQuantityModal;