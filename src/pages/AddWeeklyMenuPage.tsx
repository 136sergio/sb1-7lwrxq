import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Edit2, Check, Shuffle } from 'lucide-react';
import RecipeSelectionModal from '../components/RecipeSelectionModal';
import BackButton from '../components/BackButton';
import { menuService } from '../services/database';
import { useRecipes } from '../hooks/useSupabase';

interface MealPlanItem {
  recipeName: string;
  quantity: number;
}

function getMealTypes(count: number): string[] {
  switch (count) {
    case 1:
      return ['Comida'];
    case 2:
      return ['Comida', 'Cena'];
    case 3:
      return ['Desayuno', 'Comida', 'Cena'];
    case 4:
      return ['Desayuno', 'Comida', 'Merienda', 'Cena'];
    case 5:
      return ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
    case 6:
      return ['Desayuno', 'Media Mañana', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
    default:
      return ['Desayuno', 'Comida', 'Merienda', 'Cena'];
  }
}

const AddWeeklyMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { recipes } = useRecipes();
  const [menuName, setMenuName] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekNumber());
  const [mealCount, setMealCount] = useState(4);
  const [mealTypes, setMealTypes] = useState<string[]>(['Desayuno', 'Comida', 'Merienda', 'Cena']);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[][][]>(Array(7).fill(null).map(() => Array(4).fill([])));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [editingMealType, setEditingMealType] = useState<{ index: number; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() + i);
  const weeks = Array.from({length: 52}, (_, i) => i + 1);

  function getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  function getWeekDates(year: number, week: number) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const startDate = simple;
    if (dow <= 4)
        startDate.setDate(simple.getDate() - simple.getDay() + 1);
    else
        startDate.setDate(simple.getDate() + 8 - simple.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return {
      start: startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      end: endDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    };
  }

  useEffect(() => {
    const dates = getWeekDates(selectedYear, selectedWeek);
    setMenuName(`Menú Semana ${selectedWeek} del ${dates.start} al ${dates.end} de ${selectedYear}`);
  }, [selectedYear, selectedWeek]);

  const generateRandomMenu = () => {
    const newMealPlan = [...mealPlan];
    const usedRecipes = new Set<string>();

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const currentDay = weekDays[dayIndex];

      for (let mealIndex = 0; mealIndex < mealCount; mealIndex++) {
        const currentMealType = mealTypes[mealIndex];
        newMealPlan[dayIndex][mealIndex] = [];

        // Get recipes that match both meal type and day preferences
        let eligibleRecipes = recipes.filter(recipe => {
          const hasMealTypePreference = recipe.meal_types.length > 0;
          const hasWeekDayPreference = recipe.week_days.length > 0;
          const matchesMealType = !hasMealTypePreference || recipe.meal_types.includes(currentMealType);
          const matchesWeekDay = !hasWeekDayPreference || recipe.week_days.includes(currentDay);
          const notUsedThisWeek = !usedRecipes.has(recipe.name);

          // If recipe has preferences, they must match exactly
          if (hasMealTypePreference && !recipe.meal_types.includes(currentMealType)) return false;
          if (hasWeekDayPreference && !recipe.week_days.includes(currentDay)) return false;

          return matchesMealType && matchesWeekDay && notUsedThisWeek;
        });

        // If no recipes match the criteria, try using any unused recipe without preferences
        if (eligibleRecipes.length === 0) {
          eligibleRecipes = recipes.filter(recipe => 
            recipe.meal_types.length === 0 && 
            recipe.week_days.length === 0 && 
            !usedRecipes.has(recipe.name)
          );
        }

        // If still no recipes available, allow reusing recipes
        if (eligibleRecipes.length === 0) {
          eligibleRecipes = recipes.filter(recipe => {
            const hasMealTypePreference = recipe.meal_types.length > 0;
            const hasWeekDayPreference = recipe.week_days.length > 0;
            const matchesMealType = !hasMealTypePreference || recipe.meal_types.includes(currentMealType);
            const matchesWeekDay = !hasWeekDayPreference || recipe.week_days.includes(currentDay);

            // If recipe has preferences, they must match exactly
            if (hasMealTypePreference && !recipe.meal_types.includes(currentMealType)) return false;
            if (hasWeekDayPreference && !recipe.week_days.includes(currentDay)) return false;

            return matchesMealType && matchesWeekDay;
          });
        }

        if (eligibleRecipes.length > 0) {
          const randomIndex = Math.floor(Math.random() * eligibleRecipes.length);
          const selectedRecipe = eligibleRecipes[randomIndex];
          
          newMealPlan[dayIndex][mealIndex] = [{
            recipeName: selectedRecipe.name,
            quantity: 1
          }];

          usedRecipes.add(selectedRecipe.name);
        }
      }
    }

    setMealPlan(newMealPlan);
    setHasChanges(true);
  };

  const handleSelectRecipe = (recipe: { name: string }) => {
    const newMealPlan = [...mealPlan];
    if (newMealPlan[currentDayIndex][currentMealIndex].length < 4 && !newMealPlan[currentDayIndex][currentMealIndex].some(item => item.recipeName === recipe.name)) {
      newMealPlan[currentDayIndex][currentMealIndex] = [...newMealPlan[currentDayIndex][currentMealIndex], { recipeName: recipe.name, quantity: 1 }];
      setMealPlan(newMealPlan);
      setHasChanges(true);
    }
    setIsModalOpen(false);
  };

  const handleRemoveRecipe = (dayIndex: number, mealIndex: number, recipeIndex: number) => {
    const newMealPlan = [...mealPlan];
    newMealPlan[dayIndex][mealIndex] = newMealPlan[dayIndex][mealIndex].filter((_, index) => index !== recipeIndex);
    setMealPlan(newMealPlan);
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await menuService.create({
        name: menuName,
        year: selectedYear,
        week: selectedWeek,
        meal_count: mealCount,
        meal_types: mealTypes,
        meal_plan: mealPlan
      });
      navigate('/menus');
    } catch (error) {
      console.error('Error creating menu:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton showConfirmation={true} hasChanges={hasChanges} />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Añadir Menú Semanal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-grow">
            <label htmlFor="menuName" className="block text-sm font-medium text-gray-700">Nombre del menú</label>
            <input
              type="text"
              id="menuName"
              value={menuName}
              onChange={(e) => {
                setMenuName(e.target.value);
                setHasChanges(true);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Año</label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setHasChanges(true);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="week" className="block text-sm font-medium text-gray-700">Semana</label>
            <select
              id="week"
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(Number(e.target.value));
                setHasChanges(true);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              {weeks.map((week) => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="mealCount" className="block text-sm font-medium text-gray-700">Cantidad de comidas</label>
          <select
            id="mealCount"
            value={mealCount}
            onChange={(e) => {
              const newMealCount = Number(e.target.value);
              setMealCount(newMealCount);
              const newMealTypes = getMealTypes(newMealCount);
              setMealTypes(newMealTypes);
              setMealPlan(Array(7).fill(null).map(() => Array(newMealCount).fill([])));
              setHasChanges(true);
            }}
            className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={generateRandomMenu}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Shuffle className="h-5 w-5 mr-2" />
            Generar menú aleatorio
          </button>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2"></th>
              {weekDays.map((day) => (
                <th key={day} className="border border-gray-300 p-2">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((mealType, mealIndex) => (
              <tr key={mealType}>
                <td className="border border-gray-300 p-2 font-medium">
                  {mealType}
                </td>
                {weekDays.map((_, dayIndex) => (
                  <td key={`${mealType}-${dayIndex}`} className="border border-gray-300 p-2">
                    {mealPlan[dayIndex][mealIndex].map((item, recipeIndex) => (
                      <div key={`${item.recipeName}-${recipeIndex}`} className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.recipeName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipe(dayIndex, mealIndex, recipeIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {mealPlan[dayIndex][mealIndex].length < 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentMealIndex(mealIndex);
                          setCurrentDayIndex(dayIndex);
                          setIsModalOpen(true);
                        }}
                        className="w-full text-sm text-green-500 hover:text-green-700"
                      >
                        <Plus size={14} className="mx-auto" />
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Menú Semanal'}
          </button>
        </div>
      </form>
      
      <RecipeSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectRecipe={handleSelectRecipe}
        mealType={mealTypes[currentMealIndex]}
        weekDay={weekDays[currentDayIndex]}
        usedRecipes={new Set(mealPlan[currentDayIndex][currentMealIndex].map(item => item.recipeName))}
      />
    </div>
  );
};

export default AddWeeklyMenuPage;