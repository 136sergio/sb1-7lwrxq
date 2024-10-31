import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Check, Edit2 } from 'lucide-react';
import { useIngredients, Ingredient as IngredientType } from '../hooks/useIngredients';

interface IngredientFormProps {
  onAdd: (ingredient: { 
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
  initialIngredient?: { 
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

const IngredientForm: React.FC<IngredientFormProps> = ({
  onAdd,
  onCancel,
  initialIngredient,
  isEditing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientType | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { ingredients, loading } = useIngredients(searchTerm);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialIngredient) {
      setSearchTerm(initialIngredient.name);
      setQuantity(initialIngredient.quantity.toString());
      setSelectedIngredient({
        id: '',
        name: initialIngredient.name,
        base_unit: initialIngredient.unit,
        category: '',
        calories: initialIngredient.calories ?? 0,
        proteins: initialIngredient.proteins ?? 0,
        carbohydrates: initialIngredient.carbohydrates ?? 0,
        fats: initialIngredient.fats ?? 0,
        fiber: initialIngredient.fiber ?? 0,
        sodium: initialIngredient.sodium ?? 0,
      });
    }
  }, [initialIngredient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIngredientSelect = (ingredient: IngredientType) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    if (!isEditing) {
      setQuantity('100'); // Default quantity for new ingredients
    }
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (selectedIngredient && quantity) {
      const parsedQuantity = parseFloat(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) return;

      onAdd({
        name: selectedIngredient.name,
        quantity: parsedQuantity,
        unit: selectedIngredient.base_unit,
        is_product: false,
        calories: selectedIngredient.calories,
        proteins: selectedIngredient.proteins,
        carbohydrates: selectedIngredient.carbohydrates,
        fats: selectedIngredient.fats,
        fiber: selectedIngredient.fiber,
        sodium: selectedIngredient.sodium
      });

      if (!isEditing) {
        setSearchTerm('');
        setQuantity('');
        setSelectedIngredient(null);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className="relative flex-grow">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isEditing) {
              setShowSuggestions(true);
              setSelectedIngredient(null);
            }
          }}
          placeholder="Buscar ingrediente..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          disabled={isEditing}
        />
        {showSuggestions && searchTerm && !isEditing && (
          <div
            ref={suggestionRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {loading ? (
              <div className="p-2 text-gray-500">Buscando...</div>
            ) : ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => handleIngredientSelect(ingredient)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                >
                  {ingredient.name}
                </button>
              ))
            ) : (
              <div className="p-2 text-gray-500">No se encontraron ingredientes</div>
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
        value={selectedIngredient?.base_unit || initialIngredient?.unit || ''}
        placeholder="Medida"
        disabled
        className="w-24 rounded-md border-gray-300 shadow-sm bg-gray-100"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedIngredient || !quantity}
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

export default IngredientForm;