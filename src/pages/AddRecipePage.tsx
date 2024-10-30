import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { recipeService } from '../services/database';
import IngredientList from '../components/IngredientList';

interface Ingredient {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

const AddRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const mealTypeOptions = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
  const weekDayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleMealTypeChange = (mealType: string) => {
    setHasChanges(true);
    setMealTypes(prevMealTypes => 
      prevMealTypes.includes(mealType)
        ? prevMealTypes.filter(type => type !== mealType)
        : [...prevMealTypes, mealType]
    );
  };

  const handleWeekDayChange = (weekDay: string) => {
    setHasChanges(true);
    setWeekDays(prevWeekDays => 
      prevWeekDays.includes(weekDay)
        ? prevWeekDays.filter(day => day !== weekDay)
        : [...prevWeekDays, weekDay]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recipeIngredients = ingredients.map(ingredient => ({
        recipe_id: '', // This will be set by the service
        ingredient_id: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit
      }));

      await recipeService.create({
        name,
        meal_types: mealTypes,
        week_days: weekDays,
        instructions
      }, recipeIngredients);

      navigate('/recipes');
    } catch (error) {
      console.error('Error al crear la receta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton showConfirmation={true} hasChanges={hasChanges} />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Añadir Receta</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la receta</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasChanges(true);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-lg"
            required
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">Preferencia de comida</span>
          <div className="flex flex-wrap gap-2">
            {mealTypeOptions.map((mealType) => (
              <button
                key={mealType}
                type="button"
                onClick={() => handleMealTypeChange(mealType)}
                className={`px-3 py-1 rounded-full text-sm ${
                  mealTypes.includes(mealType)
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
          <span className="block text-sm font-medium text-gray-700 mb-2">Preferencia de día de la semana</span>
          <div className="flex flex-wrap gap-2">
            {weekDayOptions.map((weekDay) => (
              <button
                key={weekDay}
                type="button"
                onClick={() => handleWeekDayChange(weekDay)}
                className={`px-3 py-1 rounded-full text-sm ${
                  weekDays.includes(weekDay)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {weekDay}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</span>
          <IngredientList
            ingredients={ingredients}
            onChange={(newIngredients) => {
              setIngredients(newIngredients);
              setHasChanges(true);
            }}
          />
        </div>

        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instrucciones</label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              setHasChanges(true);
            }}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Receta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipePage;