import React, { useState } from 'react';
import { X, Search, Info } from 'lucide-react';
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
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  React.useEffect(() => {
    const filtered = recipes.filter((recipe) => {
      const matchesMealType = recipe.meal_types.length === 0 || recipe.meal_types.includes(mealType);
      const matchesWeekDay = recipe.week_days.length === 0 || recipe.week_days.includes(weekDay);
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isNotUsed = !usedRecipes.has(recipe.name);
      return matchesMealType && matchesWeekDay && matchesSearch && isNotUsed;
    });
    setFilteredRecipes(filtered);
  }, [recipes, mealType, weekDay, searchTerm, usedRecipes]);

  const handleClose = () => {
    setSearchTerm('');
    setExpandedRecipe(null);
    onClose();
  };

  const calculateNutrition = (recipe: Recipe) => {
    if (!recipe.recipe_ingredients?.length) return null;

    return recipe.recipe_ingredients.reduce((acc, ingredient) => {
      if (ingredient.calories === undefined) return acc;
      const ratio = ingredient.quantity / 100;
      return {
        calories: acc.calories + (ingredient.calories * ratio),
        proteins: acc.proteins + ((ingredient.proteins || 0) * ratio),
        carbohydrates: acc.carbohydrates + ((ingredient.carbohydrates || 0) * ratio),
        fats: acc.fats + ((ingredient.fats || 0) * ratio),
        fiber: acc.fiber + ((ingredient.fiber || 0) * ratio),
        sodium: acc.sodium + ((ingredient.sodium || 0) * ratio)
      };
    }, {
      calories: 0,
      proteins: 0,
      carbohydrates: 0,
      fats: 0,
      fiber: 0,
      sodium: 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Receta</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
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
              autoFocus
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div className="mt-2 max-h-96 overflow-y-auto">
          {filteredRecipes.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredRecipes.map((recipe) => {
                const nutrition = calculateNutrition(recipe);
                return (
                  <div key={recipe.id} className="py-4">
                    <div 
                      className="flex items-start space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        onSelectRecipe(recipe);
                        handleClose();
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
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
                          </div>
                          {nutrition && (
                            <span className="text-sm font-medium text-gray-600 ml-2 whitespace-nowrap">
                              {Math.round(nutrition.calories)} kcal
                            </span>
                          )}
                        </div>

                        {nutrition && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id);
                            }}
                            className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            Info nutricional
                          </button>
                        )}

                        {expandedRecipe === recipe.id && nutrition && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
                            <div className="grid grid-cols-2 gap-1">
                              <div>Proteínas: {nutrition.proteins.toFixed(1)}g</div>
                              <div>Carbohidratos: {nutrition.carbohydrates.toFixed(1)}g</div>
                              <div>Grasas: {nutrition.fats.toFixed(1)}g</div>
                              <div>Fibra: {nutrition.fiber.toFixed(1)}g</div>
                              <div>Sodio: {nutrition.sodium.toFixed(1)}mg</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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