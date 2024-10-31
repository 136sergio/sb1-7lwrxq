import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Search } from 'lucide-react';
import { useProductSearch } from '../hooks/useProductSearch';

interface ProductFormProps {
  onAdd: (product: { 
    name: string; 
    quantity: number; 
    unit: string;
    is_product: boolean;
    calories?: number;
    proteins?: number;
    carbohydrates?: number;
    fats?: number;
    fiber?: number;
    sodium?: number;
  }) => void;
  onCancel: () => void;
  initialProduct?: {
    name: string;
    quantity: number;
    unit: string;
    is_product: boolean;
    calories?: number;
    proteins?: number;
    carbohydrates?: number;
    fats?: number;
    fiber?: number;
    sodium?: number;
  };
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAdd, onCancel, initialProduct, isEditing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { products, loading } = useProductSearch(searchTerm);
  const [isSearchEnabled, setIsSearchEnabled] = useState(!isEditing);

  useEffect(() => {
    if (initialProduct) {
      setSearchTerm(initialProduct.name);
      setQuantity(initialProduct.quantity.toString());
      setSelectedProduct({
        name: initialProduct.name,
        nutrition: {
          calories: initialProduct.calories,
          proteins: initialProduct.proteins,
          carbohydrates: initialProduct.carbohydrates,
          fats: initialProduct.fats,
          fiber: initialProduct.fiber,
          sodium: initialProduct.sodium
        }
      });
    }
  }, [initialProduct]);

  const determineUnit = (product: any): string => {
    if (initialProduct) return initialProduct.unit;

    const lowerName = product.name.toLowerCase();
    const lowerQuantity = (product.quantity || '').toLowerCase();
    
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

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    if (!isEditing) {
      setQuantity('100'); // Cantidad por defecto solo para nuevos productos
    }
    setShowSuggestions(false);
    setIsSearchEnabled(false);
  };

  const handleSearchClick = () => {
    setIsSearchEnabled(true);
    setShowSuggestions(true);
    setSelectedProduct(null);
  };

  const handleSubmit = () => {
    if ((selectedProduct || !isSearchEnabled) && quantity) {
      const parsedQuantity = parseFloat(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) return;

      const productToUse = selectedProduct || {
        name: searchTerm,
        nutrition: initialProduct
      };

      const unit = determineUnit(productToUse);
      
      onAdd({
        name: productToUse.name,
        quantity: parsedQuantity,
        unit,
        is_product: true,
        calories: productToUse.nutrition?.calories,
        proteins: productToUse.nutrition?.proteins,
        carbohydrates: productToUse.nutrition?.carbohydrates,
        fats: productToUse.nutrition?.fats,
        fiber: productToUse.nutrition?.fiber,
        sodium: productToUse.nutrition?.sodium
      });
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className="relative flex-grow">
        {isEditing && !isSearchEnabled ? (
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              disabled
              className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
            />
            <button
              type="button"
              onClick={handleSearchClick}
              className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <Search size={20} />
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
              if (!isEditing) {
                setSelectedProduct(null);
              }
            }}
            placeholder="Buscar producto..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        )}
        
        {showSuggestions && searchTerm && isSearchEnabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="p-2 text-gray-500">Buscando...</div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-start space-x-2">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.brand && (
                        <div className="text-sm text-gray-500">{product.brand}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-2 text-gray-500">No se encontraron productos</div>
            )}
          </div>
        )}
      </div>

      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Cantidad"
        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        min="0.1"
        step="0.1"
      />

      <input
        type="text"
        value={selectedProduct ? determineUnit(selectedProduct) : initialProduct?.unit || ''}
        placeholder="Medida"
        disabled
        className="w-24 rounded-md border-gray-300 shadow-sm bg-gray-100"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!searchTerm || !quantity}
        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check size={14} />
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default ProductForm;