import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import BackButton from '../components/BackButton';
import { recipeService } from '../services/database';
import NutritionSummary from '../components/NutritionSummary';

interface Recipe {
  id: string;
  name: string;
  meal_types: string[];
  week_days: string[];
  recipe_ingredients?: {
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
  }[];
}

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);

  const mealTypeOptions = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
  const weekDayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setRecipes(sortedData);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setRecipeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRecipeToDelete(null);
  };

  const handleDeleteRecipe = async () => {
    if (recipeToDelete) {
      try {
        await recipeService.delete(recipeToDelete);
        await loadRecipes();
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const toggleMealType = (mealType: string) => {
    setSelectedMealTypes(prev => 
      prev.includes(mealType)
        ? prev.filter(type => type !== mealType)
        : [...prev, mealType]
    );
  };

  const toggleWeekDay = (weekDay: string) => {
    setSelectedWeekDays(prev => 
      prev.includes(weekDay)
        ? prev.filter(day => day !== weekDay)
        : [...prev, weekDay]
    );
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

  const filteredRecipes = recipes.filter(recipe => {
    const matchesMealType = selectedMealTypes.length === 0 || 
      selectedMealTypes.some(type => recipe.meal_types.includes(type));
    const matchesWeekDay = selectedWeekDays.length === 0 || 
      selectedWeekDays.some(day => recipe.week_days.includes(day));
    return matchesMealType && matchesWeekDay;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Recetas</h1>
      <Button icon={<Plus />} text="Añadir Receta" to="/add-recipe" />

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por preferencia de comida:</h3>
          <div className="flex flex-wrap gap-2">
            {mealTypeOptions.map((mealType) => (
              <button
                key={mealType}
                onClick={() => toggleMealType(mealType)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedMealTypes.includes(mealType)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {mealType}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por preferencia de día:</h3>
          <div className="flex flex-wrap gap-2">
            {weekDayOptions.map((weekDay) => (
              <button
                key={weekDay}
                onClick={() => toggleWeekDay(weekDay)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedWeekDays.includes(weekDay)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {weekDay}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {filteredRecipes.length > 0 ? (
          <ul className="space-y-4">
            {filteredRecipes.map((recipe) => {
              const nutrition = calculateNutrition(recipe);
              return (
                <li key={recipe.id} className="bg-white shadow-md rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-gray-800">{recipe.name}</span>
                      {(recipe.meal_types.length > 0 || recipe.week_days.length > 0) && (
                        <div className="mt-1 space-y-1">
                          {recipe.meal_types.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {recipe.meal_types.map((type) => (
                                <span key={type} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  {type}
                                </span>
                              ))}
                            </div>
                          )}
                          {recipe.week_days.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {recipe.week_days.map((day) => (
                                <span key={day} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  {day}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      {nutrition && (
                        <NutritionSummary nutrition={nutrition} />
                      )}
                      <div className="flex space-x-2">
                        <Link
                          to={`/edit-recipe/${recipe.id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                        <button
                          onClick={() => openDeleteModal(recipe.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4">
            <p className="text-gray-500 italic">No hay recetas que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteRecipe}
        message="¿Estás seguro de que quieres eliminar esta receta?"
      />
    </div>
  );
};

export default RecipesPage;