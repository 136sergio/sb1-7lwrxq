import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Check, Edit2 } from 'lucide-react';
import { useIngredients, Ingredient } from '../hooks/useIngredients';

interface IngredientFormProps {
  onAdd: (ingredient: { ingredientId: string; name: string; quantity: number; unit: string }) => void;
  onEdit?: (index: number, ingredient: { ingredientId: string; name: string; quantity: number; unit: string }) => void;
  onRemove?: (index: number) => void;
  initialIngredient?: { ingredientId: string; name: string; quantity: number; unit: string };
  isEditing?: boolean;
  index?: number;
}

const IngredientForm: React.FC<IngredientFormProps> = ({
  onAdd,
  onEdit,
  onRemove,
  initialIngredient,
  isEditing,
  index
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { ingredients, loading } = useIngredients(searchTerm);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialIngredient) {
      setSearchTerm(initialIngredient.name);
      setQuantity(initialIngredient.quantity.toString());
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

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (selectedIngredient && quantity) {
      const ingredientData = {
        ingredientId: selectedIngredient.id,
        name: selectedIngredient.name,
        quantity: parseFloat(quantity),
        unit: selectedIngredient.base_unit
      };

      if (isEditing && typeof index === 'number' && onEdit) {
        onEdit(index, ingredientData);
      } else {
        onAdd(ingredientData);
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
            setShowSuggestions(true);
            setSelectedIngredient(null);
          }}
          placeholder="Buscar ingrediente..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
        {showSuggestions && searchTerm && (
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
        disabled={!selectedIngredient}
        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100"
        min="0.1"
        step="0.1"
      />

      <input
        type="text"
        value={selectedIngredient?.base_unit || ''}
        placeholder="Medida"
        disabled
        className="w-24 rounded-md border-gray-300 shadow-sm bg-gray-100"
      />

      {isEditing ? (
        <>
          <button
            type="button"
            onClick={handleSubmit}
            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
          >
            <Check size={14} />
          </button>
          {onRemove && typeof index === 'number' && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            >
              <X size={14} />
            </button>
          )}
        </>
      ) : (
        <>
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
            onClick={() => {
              setSearchTerm('');
              setQuantity('');
              setSelectedIngredient(null);
            }}
            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
          >
            <X size={14} />
          </button>
        </>
      )}
    </div>
  );
};

export default IngredientForm;