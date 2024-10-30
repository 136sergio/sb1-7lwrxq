import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useRecipes } from '../hooks/useSupabase';
import { Recipe } from '../services/database';

interface RecipeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  mealType: string;
  weekDay: string;
  usedRecipes: Set<string>;
}

const RecipeSelectionModal: React.FC<RecipeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  mealType,
  weekDay,
  usedRecipes,
}) => {
  const { recipes } = useRecipes();
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = recipes.filter((recipe) => {
      const matchesMealType = recipe.meal_types.length === 0 || recipe.meal_types.includes(mealType);
      const matchesWeekDay = recipe.week_days.length === 0 || recipe.week_days.includes(weekDay);
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isNotUsed = !usedRecipes.has(recipe.name);
      return matchesMealType && matchesWeekDay && matchesSearch && isNotUsed;
    });
    setFilteredRecipes(filtered);
  }, [recipes, mealType, weekDay, searchTerm, usedRecipes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Receta</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar recetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div className="mt-2 max-h-96 overflow-y-auto">
          {filteredRecipes.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    onSelectRecipe(recipe);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                  {recipe.meal_types.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {recipe.meal_types.map(type => (
                        <span key={type} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay recetas disponibles para esta selección.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSelectionModal;