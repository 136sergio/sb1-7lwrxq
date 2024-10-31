import React, { useState } from 'react';
import { X, Search, Info, AlertCircle } from 'lucide-react';
import { useProductSearch } from '../hooks/useProductSearch';

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: any) => void;
}

const ProductSearchModal: React.FC<ProductSearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, loading, error } = useProductSearch(searchTerm);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Producto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div className="mt-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : products.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <div key={product.id} className="py-4">
                  <button
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start space-x-4">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-16 h-16 object-contain"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                        {product.brand && (
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        )}
                        {product.quantity && (
                          <p className="text-sm text-gray-500">{product.quantity}</p>
                        )}
                        
                        {product.nutrition ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProduct(expandedProduct === product.id ? null : product.id);
                            }}
                            className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            Info nutricional
                          </button>
                        ) : (
                          <div
                            className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-red-700 bg-red-100"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Info nutricional no disponible
                          </div>
                        )}

                        {expandedProduct === product.id && product.nutrition && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
                            <div className="grid grid-cols-2 gap-1">
                              <div>Calorías: {product.nutrition.calories}kcal</div>
                              <div>Proteínas: {product.nutrition.proteins}g</div>
                              <div>Carbohidratos: {product.nutrition.carbohydrates}g</div>
                              <div>Grasas: {product.nutrition.fats}g</div>
                              <div>Fibra: {product.nutrition.fiber}g</div>
                              <div>Sodio: {product.nutrition.sodium}g</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <p className="text-gray-500 text-center py-4">No se encontraron productos</p>
          ) : (
            <p className="text-gray-500 text-center py-4">Introduce un término de búsqueda</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSearchModal;