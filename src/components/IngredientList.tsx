import React, { useState } from 'react';
import { Plus, Edit2, X, ShoppingCart } from 'lucide-react';
import IngredientForm from './IngredientForm';
import ProductForm from './ProductForm';
import NutritionInfo from './NutritionInfo';

interface Ingredient {
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
}

interface IngredientListProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients, onChange }) => {
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = (ingredient: Ingredient) => {
    const newIngredients = [...ingredients, ingredient];
    onChange(newIngredients);
    setShowIngredientForm(false);
    setShowProductForm(false);
  };

  const handleEdit = (index: number, updatedIngredient: Ingredient) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = updatedIngredient;
    onChange(newIngredients);
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    onChange(newIngredients);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <div key={index}>
            {editingIndex === index ? (
              ingredient.is_product ? (
                <ProductForm
                  initialProduct={ingredient}
                  onAdd={(updatedIngredient) => handleEdit(index, updatedIngredient)}
                  onCancel={() => setEditingIndex(null)}
                  isEditing
                />
              ) : (
                <IngredientForm
                  initialIngredient={ingredient}
                  onAdd={(updatedIngredient) => handleEdit(index, updatedIngredient)}
                  onCancel={() => setEditingIndex(null)}
                  isEditing
                />
              )
            ) : (
              <div className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm">
                <div className="flex items-center">
                  <span>
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </span>
                  {ingredient.is_product && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <ShoppingCart size={12} className="mr-1" />
                    </span>
                  )}
                </div>
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
      </div>

      {showIngredientForm ? (
        <IngredientForm
          onAdd={handleAdd}
          onCancel={() => setShowIngredientForm(false)}
        />
      ) : showProductForm ? (
        <ProductForm
          onAdd={handleAdd}
          onCancel={() => setShowProductForm(false)}
        />
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowIngredientForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus size={16} className="mr-2" />
            Añadir Ingrediente
          </button>
          <button
            type="button"
            onClick={() => setShowProductForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <ShoppingCart size={16} className="mr-2" />
            Añadir Producto
          </button>
        </div>
      )}

      {ingredients.length > 0 && <NutritionInfo ingredients={ingredients} />}
    </div>
  );
};

export default IngredientList;