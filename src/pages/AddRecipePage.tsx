import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Edit2, Check } from 'lucide-react';
import BackButton from '../components/BackButton';
import { recipeService } from '../services/database';

interface Ingredient {
  quantity: string;
  measure: string;
  name: string;
}

const AddRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({ quantity: '', measure: '', name: '' });
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [instructions, setInstructions] = useState('');
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const measureOptions = ['Unidad/es', 'Miligramo/s', 'Gramo/s', 'Kilo/s', 'Mililitro/s', 'Litro/s', 'Cucharada/s', 'Cucharada/s de café', 'Cucharada/s sopera', 'Taza/s'];
  const mealTypeOptions = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
  const weekDayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleIngredientChange = (field: keyof Ingredient, value: string) => {
    setHasChanges(true);
    if (editingIngredientIndex !== null) {
      const updatedIngredients = [...ingredients];
      updatedIngredients[editingIngredientIndex] = {
        ...updatedIngredients[editingIngredientIndex],
        [field]: value
      };
      setIngredients(updatedIngredients);
    } else {
      setCurrentIngredient({ ...currentIngredient, [field]: value });
    }
  };

  const addIngredient = () => {
    if (currentIngredient.quantity && currentIngredient.measure && currentIngredient.name) {
      setHasChanges(true);
      setIngredients([...ingredients, currentIngredient]);
      setCurrentIngredient({ quantity: '', measure: '', name: '' });
      setShowIngredientForm(false);
    }
  };

  const startEditingIngredient = (index: number) => {
    setEditingIngredientIndex(index);
  };

  const saveEditingIngredient = () => {
    setEditingIngredientIndex(null);
  };

  const removeIngredient = (index: number) => {
    setHasChanges(true);
    setIngredients(ingredients.filter((_, i) => i !== index));
    if (editingIngredientIndex === index) {
      setEditingIngredientIndex(null);
    }
  };

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
      const recipe = {
        name,
        meal_types: mealTypes,
        week_days: weekDays,
        ingredients: ingredients.map(({ quantity, measure, name }) => `${quantity} ${measure} ${name}`).join(', '),
        instructions
      };

      await recipeService.create(recipe);
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
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              {editingIngredientIndex === index ? (
                <>
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange('quantity', e.target.value)}
                    placeholder="Cantidad"
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <select
                    value={ingredient.measure}
                    onChange={(e) => handleIngredientChange('measure', e.target.value)}
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {measureOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange('name', e.target.value)}
                    placeholder="Ingrediente"
                    className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => saveEditingIngredient()}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    <Check size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-grow">{ingredient.quantity} {ingredient.measure} {ingredient.name}</span>
                  <button
                    type="button"
                    onClick={() => startEditingIngredient(index)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {showIngredientForm ? (
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="number"
                value={currentIngredient.quantity}
                onChange={(e) => handleIngredientChange('quantity', e.target.value)}
                placeholder="Cantidad"
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
              <select
                value={currentIngredient.measure}
                onChange={(e) => handleIngredientChange('measure', e.target.value)}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="">Seleccionar</option>
                {measureOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="text"
                value={currentIngredient.name}
                onChange={(e) => handleIngredientChange('name', e.target.value)}
                placeholder="Ingrediente"
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
              <button
                type="button"
                onClick={addIngredient}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowIngredientForm(false)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowIngredientForm(true)}
              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus size={16} className="mr-2" />
              Añadir Ingrediente
            </button>
          )}
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