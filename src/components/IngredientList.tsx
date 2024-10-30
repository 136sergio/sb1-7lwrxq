import React, { useState } from 'react';
import { Plus, Edit2, X } from 'lucide-react';
import IngredientForm from './IngredientForm';

interface Ingredient {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients, onChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = (ingredient: Ingredient) => {
    onChange([...ingredients, ingredient]);
    setShowForm(false);
  };

  const handleEdit = (index: number, updatedIngredient: Ingredient) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = updatedIngredient;
    onChange(newIngredients);
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div>
      {ingredients.map((ingredient, index) => (
        <div key={`${ingredient.ingredientId}-${index}`}>
          {editingIndex === index ? (
            <IngredientForm
              initialIngredient={ingredient}
              onEdit={(_, updatedIngredient) => handleEdit(index, updatedIngredient)}
              onRemove={() => handleRemove(index)}
              isEditing
              index={index}
            />
          ) : (
            <div className="flex items-center justify-between mb-2 bg-white p-2 rounded-md shadow-sm">
              <span className="flex-grow">
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(index)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showForm ? (
        <IngredientForm onAdd={handleAdd} />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus size={16} className="mr-2" />
          Añadir Ingrediente
        </button>
      )}
    </div>
  );
};

export default IngredientList;